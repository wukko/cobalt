import { test, expect } from '@playwright/test';

test.use({ actionTimeout: 20000 })

test.describe('youtube', () => {
  test('4k video (h264, 1440)', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://www.youtube.com/watch?v=vPwaXytZcgI')
    await page.locator('#audioMode-false').click()

    // Open settings modal
    await page.locator('#settings-footer').click()
    await page.locator('#tab-button-settings-video').click()
    await page.locator('#vQuality-1440').click()
    await page.locator('#vCodec-h264').click()
    // Close modal
    await page.getByRole('button', { name: 'go back and close the popup' }).click()

    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    expect(apiResponse.status).toBe('stream')
    expect(apiResponse.url).toContain('api/stream?t=')
  });
})
