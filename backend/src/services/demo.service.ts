import { buildDemoDataset } from '../data/demo-seed.data.js';
import { contactLinkRepository, contactRepository, jobRepository, taskRepository } from '../db/repositories.js';

const REPOSITORIES = [contactLinkRepository, taskRepository, contactRepository, jobRepository];

export async function clearUserData(userId: string): Promise<void> {
    for (const repository of REPOSITORIES) {
        await repository.deleteAllByUser(userId);
    }
}

export async function seedDemoData(userId: string): Promise<void> {
    await clearUserData(userId);

    const { jobs, tasks, contacts, contactLinks } = buildDemoDataset(userId);

    await jobRepository.insertMany(jobs);
    await contactRepository.insertMany(contacts);
    await taskRepository.insertMany(tasks);
    await contactLinkRepository.insertMany(contactLinks);
}
