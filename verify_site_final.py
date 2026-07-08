
import asyncio
from playwright.async_api import async_playwright
import sys

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        print("Navigating to site...")
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(2000)

        # Capture home
        await page.screenshot(path="public_home.png")

        # Navigate to a CMS page to see the Tree Menu
        print("Testing Tree Navigation...")
        nav_buttons = page.locator("nav .group\/sub button")
        count = await nav_buttons.count()
        print(f"Found {count} nav buttons.")
        if count > 0:
            await nav_buttons.first.hover()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="nav_tree_hover.png")

        # Check Product Details and specifications
        print("Checking Product Details...")
        # Site uses "Ficha" button in ProductCard
        await page.click("text='Ficha'", timeout=10000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path="public_product_details_tree.png")

        # Check if Linked Scheme is visible in product details
        if "Esquemas de Pintura Recomendados" in await page.content():
            print("Success: Linked schemes visible in product details.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
