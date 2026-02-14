import { expect, type Page, type TestInfo } from '@playwright/test';

export interface Verification {
    spec: string;
    check: () => Promise<void>;
}

export interface StepConfig {
    description: string;
    verifications: Verification[];
    networkStatus?: 'idle' | 'skip';
}

export class TestStepHelper {
    private page: Page;
    private testInfo: TestInfo;
    private steps: { name: string; description: string; verifications: string[] }[] = [];
    private title: string = '';
    private summary: string = '';

    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
    }

    setMetadata(title: string, summary: string) {
        this.title = title;
        this.summary = summary;
    }

    async step(name: string, config: StepConfig) {
        await this.page.evaluate((stepName) => console.log(`[STEP] ${stepName}`), name);

        // Visual Snapshot
        // await expect(this.page).toHaveScreenshot(`${name}.png`);

        // Verifications
        for (const v of config.verifications) {
            await v.check();
        }

        // Record for docs
        this.steps.push({
            name,
            description: config.description,
            verifications: config.verifications.map(v => v.spec)
        });
    }

    generateDocs() {
        console.log('Generating Docs (Placeholder for now)');
        // In a real implementation this might write a markdown file
    }
}
