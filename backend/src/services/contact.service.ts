import crypto from 'crypto';
import { ERROR_MESSAGE } from '../core/constants/app.constant.js';
import { HttpError } from '../core/errors/http-error.js';
import { contactLinkRepository, contactRepository } from '../db/repositories.js';
import type { Contact } from '../models/index.js';
import type { CreateContactPayload, UpdateContactPayload } from '../schema/contact.schema.js';

export async function listContacts(userId: string): Promise<Contact[]> {
    return contactRepository.findAllByUser(userId, { column: 'name', ascending: true });
}

export async function createContact(userId: string, payload: CreateContactPayload): Promise<Contact> {
    return contactRepository.insert({
        ...payload,
        email: payload.email || undefined,
        linkedin_url: payload.linkedin_url || undefined,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
    });
}

export async function updateContact(userId: string, contactId: string, patch: UpdateContactPayload): Promise<Contact> {
    const updated = await contactRepository.updateForUser(contactId, userId, patch);
    if (!updated) {
        throw HttpError.notFound(ERROR_MESSAGE.CONTACT_NOT_FOUND);
    }
    return updated;
}

export async function deleteContact(userId: string, contactId: string): Promise<void> {
    const existing = await contactRepository.findByIdForUser(contactId, userId);
    if (!existing) {
        throw HttpError.notFound(ERROR_MESSAGE.CONTACT_NOT_FOUND);
    }

    const links = await contactLinkRepository.findAllByUser(userId);
    await Promise.all(
        links
            .filter((link) => link.contact_id === contactId)
            .map((link) => contactLinkRepository.deleteForUser(link.id, userId)),
    );

    await contactRepository.deleteForUser(contactId, userId);
}
