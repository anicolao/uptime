import { expect, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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
    private steps: { name: string; screenshot: string; description: string; verifications: string[] }[] = [];
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

    async step(name: string, config: StepConfig, action?: () => Promise<void>) {
        await this.page.evaluate((stepName) => console.log(`[STEP] ${stepName}`), name);

        if (action) {
            await action();
        }

        // Verifications
        for (const v of config.verifications) {
            await v.check();
        }

        // Dynamic values are masked; every remaining pixel must match exactly.
        const screenshotName = `${name.replace(/[^A-Za-z0-9._-]+/g, '-')}.png`;
        await expect(this.page).toHaveScreenshot(screenshotName, {
            mask: [this.page.locator('[data-screenshot-dynamic]')],
            maskColor: '#dbe3ee'
        });

        // Record for docs
        this.steps.push({
            name,
            screenshot: screenshotName,
            description: config.description,
            verifications: config.verifications.map(v => v.spec)
        });
    }

    generateDocs() {
        if (!this.title) {
            console.warn('Metadata not set for TestStepHelper. Skipping docs generation.');
            return;
        }

        const testDir = path.dirname(this.testInfo.file);
        const readmePath = path.join(testDir, 'README.md');

        let md = `# ${this.title}\n\n`;
        md += `${this.summary}\n\n`;
        md += `## Test Steps\n\n`;

        this.steps.forEach(step => {
            md += `### ${step.name}\n\n`;
            md += `**Description:** ${step.description}\n\n`;
            md += `**Verifications:**\n`;
            step.verifications.forEach(v => {
                md += `- ${v}\n`;
            });
            md += `\n![Screenshot](screenshots/${step.screenshot})\n\n`;
            md += `---\n\n`;
        });

        fs.writeFileSync(readmePath, md);
        console.log(`Generated documentation at: ${readmePath}`);
    }
}
