import { test, expect } from '@playwright/test';

test.use({ actionTimeout: 20000 })

test.describe('twitter', () => {
  test('regular', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://twitter.com/TwitterSpaces/status/1526955853743546372?s=20')
    await page.locator('#audioMode-false').click()
    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    // Returns: https://video.twimg.com/ext_tw_video/1526951201417449472/pu/vid/1280x720/nANIA8WYXkGiX5xz.mp4?tag=12
    expect(apiResponse.url).toContain('video.twimg.com/ext_tw_video')
  });
  test('embedded', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://twitter.com/dustbin_nie/status/1624596567188717568?s=20')
    await page.locator('#audioMode-false').click()
    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    // Returns https://video.twimg.com/ext_tw_video/1606923392661483520/pu/vid/720x1188/Y2loL6INVP0nBqe8.mp4?tag=12
    expect(apiResponse.url).toContain('video.twimg.com/ext_tw_video')
  });
  test.skip('mixed media', async ({ page }) => {
    // This tweet is not available anymore, leaving test so URL can be replaced in the future if anyone wants
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://twitter.com/Twitter/status/1580661436132757506?s=20')
    await page.locator('#audioMode-false').click()
    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()
    console.log("mixed media apires", apiResponse)

    expect(apiResponse.url).toContain('video.twimg.com/ext_tw_video')
  });
  test('picker: mixed media (3 videos)', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://twitter.com/DankGameAlert/status/1584726006094794774')
    await page.locator('#audioMode-false').click()
    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    expect(apiResponse.status).toBe('picker')
    expect(apiResponse.picker).toHaveLength(3)
  });
  test('audio from embedded twitter video (mp3, isAudioOnly)', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://twitter.com/dustbin_nie/status/1624596567188717568?s=20')
    await page.locator('#audioMode-true').click()
    await page.locator('#download-button').click()

    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    expect(apiResponse.status).toBe('stream')
    expect(apiResponse.url).toContain('api/stream?t=')
  });
  test('audio from embedded twitter video (best, isAudioOnly)', async ({ page }) => {
    await page.goto('/');

    await page.locator('#url-input-area').fill('https://twitter.com/dustbin_nie/status/1624596567188717568?s=20')
    await page.locator('#audioMode-true').click()

    // Open settings modal
    await page.locator('#settings-footer').click()
    await page.locator('#tab-button-settings-audio').click()
    await page.locator('#aFormat-best').click()
    // Close modal
    await page.getByRole('button', { name: 'go back and close the popup' }).click()

    // Listen to the request going to API before clicking 'download' button
    const apiRequestBodyPromise = page.waitForRequest(request => {
      if (request.url() === 'http://localhost:9000/api/json') {
        return request.postDataJSON()
      }
    })

    await page.locator('#download-button').click()

    // Await api request listener after clicking download button
    // Expect API request body to match what we selected
    const apiRequest = await apiRequestBodyPromise
    const apiRequestBody = apiRequest.postDataJSON()

    expect(apiRequestBody.aFormat).toBe('best')
    expect(apiRequestBody.isAudioOnly).toBe(true)

    // Expect API response body to match what we expect
    const responsePromise = await page.waitForResponse('http://localhost:9000/api/json');
    const apiResponse = await responsePromise.json()

    expect(apiResponse.status).toBe('stream')
    expect(apiResponse.url).toContain('api/stream?t=')
  });
})
