import dns from 'dns/promises';
import net from 'net';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal'];

const BLOCKED_IPV4_RANGES: ReadonlyArray<[string, number]> = [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4],
];

function ipv4ToInt(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isBlockedIpv4(ip: string): boolean {
    const value = ipv4ToInt(ip);
    return BLOCKED_IPV4_RANGES.some(([range, bits]) => {
        const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
        return (value & mask) === (ipv4ToInt(range) & mask);
    });
}

function isBlockedIpv6(ip: string): boolean {
    const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');
    if (normalized === '::' || normalized === '::1') {
        return true;
    }
    return /^f[cd]/.test(normalized) || /^fe[89ab]/.test(normalized);
}

function isBlockedAddress(ip: string): boolean {
    const version = net.isIP(ip);
    if (version === 4) {
        return isBlockedIpv4(ip);
    }
    if (version === 6) {
        return isBlockedIpv6(ip);
    }
    return true;
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error('URL is not valid');
    }

    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
        throw new Error('Only http and https URLs are supported');
    }

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (BLOCKED_HOSTNAMES.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
        throw new Error('URL host is not permitted');
    }

    if (net.isIP(hostname)) {
        if (isBlockedAddress(hostname)) {
            throw new Error('URL host is not permitted');
        }
        return url;
    }

    const records = await dns.lookup(hostname, { all: true }).catch(() => []);
    if (records.length === 0) {
        throw new Error('URL host could not be resolved');
    }
    if (records.some((record) => isBlockedAddress(record.address))) {
        throw new Error('URL host is not permitted');
    }

    return url;
}
