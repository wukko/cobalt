import { test, expect } from '@playwright/test';

test.describe('initial setup', () => {
  test('web app is up', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/cobalt/);
  });
  test('api is up', async ({ request }) => {
    const response = await request.get('http://localhost:9000/api/serverInfo')
    const responseBody = JSON.parse(await response.text())

    expect(responseBody.version).toBeDefined()
  });
})
