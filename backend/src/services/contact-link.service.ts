import crypto from 'crypto';
import { ERROR_MESSAGE } from '../core/constants/app.constant.js';
import { HttpError } from '../core/errors/http-error.js';
import { contactLinkRepository } from '../db/repositories.js';
import type { ContactLink } from '../models/index.js';
import type { UpdateContactLinkPayload, UpsertContactLinkPayload } from '../schema/contact-link.schema.js';

export interface UpsertResult {
    link: ContactLink;
    created: boolean;
}

export async function listContactLinks(userId: string): Promise<ContactLink[]> {
    return contactLinkRepository.findAllByUser(userId);
}

export async function upsertContactLink(userId: string, payload: UpsertContactLinkPayload): Promise<UpsertResult> {
    const existing = await contactLinkRepository.findOneByUserWhere(userId, {
        contact_id: payload.contact_id,
        job_id: payload.job_id,
    } as Partial<ContactLink>);

    if (existing) {
        const updated = await contactLinkRepository.updateForUser(existing.id, userId, {
            status: payload.status,
            notes: payload.notes,
            last_updated: new Date().toISOString(),
        });
        return { link: updated ?? existing, created: false };
    }

    const link = await contactLinkRepository.insert({
        ...payload,
        id: crypto.randomUUID(),
        user_id: userId,
        last_updated: new Date().toISOString(),
    });

    return { link, created: true };
}

export async function updateContactLink(
    userId: string,
    linkId: string,
    patch: UpdateContactLinkPayload,
): Promise<ContactLink> {
    const updated = await contactLinkRepository.updateForUser(linkId, userId, {
        ...patch,
        last_updated: new Date().toISOString(),
    });
    if (!updated) {
        throw HttpError.notFound(ERROR_MESSAGE.CONTACT_LINK_NOT_FOUND);
    }
    return updated;
}

export async function deleteContactLink(userId: string, linkId: string): Promise<void> {
    const deleted = await contactLinkRepository.deleteForUser(linkId, userId);
    if (!deleted) {
        throw HttpError.notFound(ERROR_MESSAGE.CONTACT_LINK_NOT_FOUND);
    }
}
