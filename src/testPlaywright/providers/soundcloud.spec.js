import { test, expect } from '@playwright/test';

test.use({ actionTimeout: 20000 })

test.describe('soundcloud', () => {
  test('public song (best)', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area')
      .fill('https://soundcloud.com/l2share77/loona-butterfly?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing')
    await page.locator('#audioMode-false').click()

    // Open settings modal
    await page.locator('#settings-footer').click()
    await page.locator('#tab-button-settings-audio').click()
    await page.locator('#aFormat-best').click()
    // Close modal
    await page.getByRole('button', { name: 'go back and close the popup' }).click()

    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    expect(apiResponse.status).toBe('stream')
    expect(apiResponse.url).toContain('api/stream?t=')
  });
})
