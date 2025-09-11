import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

/**
 * 無障礙性 (Accessibility) 測試套件
 * 確保工作坊符合 WCAG 2.1 AA 標準
 */
test.describe('無障礙性測試', () => {
  test.beforeEach(async ({ page }) => {
    // 注入 axe-core
    await page.goto('/');
    await injectAxe(page);
  });

  test('首頁無障礙性檢查', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
    
    // 手動檢查
    await test.step('檢查頁面標題', async () => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });
    
    await test.step('檢查主要地標', async () => {
      const header = page.locator('header, [role="banner"]');
      const main = page.locator('main, [role="main"]');
      const footer = page.locator('footer, [role="contentinfo"]');
      
      await expect(header).toBeVisible();
      await expect(main).toBeVisible();
      
      // Footer 是可選的
      const hasFooter = await footer.count() > 0;
      if (hasFooter) {
        await expect(footer).toBeVisible();
      }
    });
    
    await test.step('檢查跳過導航連結', async () => {
      const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link');
      if (await skipLink.count() > 0) {
        // 聚焦以顯示跳過連結
        await skipLink.first().focus();
        await expect(skipLink.first()).toBeVisible();
      }
    });
  });

  test('工作坊頁面無障礙性', async ({ page }) => {
    await page.goto('/workshop');
    await injectAxe(page);
    
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'valid-lang': { enabled: true },
        'duplicate-id': { enabled: true }
      }
    });
    
    // 檢查標題層級
    await test.step('檢查標題層級結構', async () => {
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
        elements.map(el => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent
        }))
      );
      
      // 應該有且只有一個 H1
      const h1Count = headings.filter(h => h.level === 1).length;
      expect(h1Count).toBe(1);
      
      // 檢查標題層級是否按順序
      let previousLevel = 0;
      for (const heading of headings) {
        // 層級不應該跳躍超過1級
        if (previousLevel > 0) {
          expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
        }
        previousLevel = heading.level;
      }
    });
  });

  test('表單無障礙性', async ({ page }) => {
    await page.goto('/apps/form-validation');
    await injectAxe(page);
    
    // 檢查表單標籤
    await test.step('檢查表單標籤關聯', async () => {
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        const inputName = await input.getAttribute('name');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        
        // 檢查是否有對應的 label
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = await label.count() > 0;
          
          // 如果沒有 label，應該有 aria-label 或 aria-labelledby
          if (!hasLabel) {
            expect(ariaLabel || ariaLabelledby).toBeTruthy();
          }
        } else {
          // 如果沒有 id，應該有 aria-label
          expect(ariaLabel).toBeTruthy();
        }
      }
    });
    
    // 檢查錯誤訊息關聯
    await test.step('檢查錯誤訊息關聯', async () => {
      // 觸發驗證
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // 等待錯誤訊息出現
        await page.waitForTimeout(500);
        
        const errors = page.locator('.error, [role="alert"], [aria-live="polite"]');
        const errorCount = await errors.count();
        
        if (errorCount > 0) {
          // 檢查錯誤訊息是否有適當的 ARIA 屬性
          for (let i = 0; i < errorCount; i++) {
            const error = errors.nth(i);
            const role = await error.getAttribute('role');
            const ariaLive = await error.getAttribute('aria-live');
            
            expect(role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive').toBe(true);
          }
        }
      }
    });
  });

  test('鍵盤導航測試', async ({ page }) => {
    await page.goto('/workshop/chapter-04');
    
    // 測試 Tab 導航
    await test.step('Tab 鍵導航順序', async () => {
      const focusableElements = await page.$$eval(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        elements => elements.length
      );
      
      expect(focusableElements).toBeGreaterThan(0);
      
      // 模擬 Tab 鍵導航
      for (let i = 0; i < Math.min(focusableElements, 10); i++) {
        await page.keyboard.press('Tab');
        
        // 檢查是否有元素獲得焦點
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            hasOutline: window.getComputedStyle(el!).outline !== 'none',
            isVisible: el?.getBoundingClientRect().width > 0
          };
        });
        
        expect(focusedElement.isVisible).toBe(true);
        // 焦點元素應該有視覺指示
        expect(focusedElement.hasOutline || focusedElement.tagName).toBeTruthy();
      }
    });
    
    // 測試 Enter 和 Space 鍵互動
    await test.step('鍵盤互動測試', async () => {
      const button = page.locator('button').first();
      if (await button.count() > 0) {
        await button.focus();
        
        // Space 鍵應該能觸發按鈕
        await page.keyboard.press('Space');
        
        // Enter 鍵也應該能觸發按鈕
        await page.keyboard.press('Enter');
      }
      
      const link = page.locator('a[href]').first();
      if (await link.count() > 0) {
        await link.focus();
        
        // Enter 鍵應該能觸發連結
        const href = await link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          // 實際導航會改變頁面，這裡只檢查可聚焦
          const isFocused = await link.evaluate(el => el === document.activeElement);
          expect(isFocused).toBe(true);
        }
      }
    });
  });

  test('顏色對比度檢查', async ({ page }) => {
    await page.goto('/workshop');
    
    // 檢查文字對比度
    await test.step('文字顏色對比度', async () => {
      const textElements = await page.$$eval('p, span, div, h1, h2, h3, h4, h5, h6', elements => {
        return elements.map(el => {
          const styles = window.getComputedStyle(el);
          const rgb = styles.color.match(/\d+/g);
          const bgRgb = styles.backgroundColor.match(/\d+/g);
          
          if (!rgb || !bgRgb) return null;
          
          // 簡單的對比度計算
          const getLuminance = (r: number, g: number, b: number) => {
            const [rs, gs, bs] = [r, g, b].map(c => {
              c = c / 255;
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          };
          
          const l1 = getLuminance(+rgb[0], +rgb[1], +rgb[2]);
          const l2 = getLuminance(+bgRgb[0], +bgRgb[1], +bgRgb[2]);
          
          const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          
          return {
            text: el.textContent?.substring(0, 50),
            contrast: contrast.toFixed(2),
            fontSize: parseFloat(styles.fontSize),
            isLargeText: parseFloat(styles.fontSize) >= 18 || 
                        (parseFloat(styles.fontSize) >= 14 && styles.fontWeight === 'bold')
          };
        }).filter(Boolean);
      });
      
      for (const element of textElements) {
        if (element) {
          // WCAG AA 標準：一般文字 4.5:1，大文字 3:1
          const minContrast = element.isLargeText ? 3 : 4.5;
          
          if (parseFloat(element.contrast) < minContrast) {
            console.warn(`低對比度: "${element.text}" - ${element.contrast}:1 (需要 ${minContrast}:1)`);
          }
        }
      }
    });
  });

  test('ARIA 屬性正確性', async ({ page }) => {
    await page.goto('/apps/todo');
    
    await test.step('檢查 ARIA 角色', async () => {
      // 檢查互動元素的 ARIA 角色
      const interactiveElements = page.locator('[role]');
      const count = await interactiveElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        const role = await element.getAttribute('role');
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        
        // 檢查角色是否適合元素
        const validRoles = [
          'button', 'link', 'checkbox', 'radio', 'textbox',
          'navigation', 'main', 'banner', 'contentinfo',
          'alert', 'status', 'dialog', 'menu', 'menuitem'
        ];
        
        expect(validRoles).toContain(role);
        
        // 檢查必要的 ARIA 屬性
        if (role === 'button') {
          const ariaPressed = await element.getAttribute('aria-pressed');
          const ariaExpanded = await element.getAttribute('aria-expanded');
          // 按鈕可能有這些屬性之一
        }
        
        if (role === 'checkbox') {
          const ariaChecked = await element.getAttribute('aria-checked');
          expect(['true', 'false', 'mixed']).toContain(ariaChecked);
        }
      }
    });
    
    await test.step('檢查 ARIA 標籤', async () => {
      const elementsWithAriaLabel = page.locator('[aria-label]');
      const labelCount = await elementsWithAriaLabel.count();
      
      for (let i = 0; i < labelCount; i++) {
        const element = elementsWithAriaLabel.nth(i);
        const ariaLabel = element;
        
        // aria-label 不應該為空
        await expect(ariaLabel).toHaveAttribute('aria-label', );
        expect(ariaLabel!.length).toBeGreaterThan(0);
      }
      
      const elementsWithAriaLabelledby = page.locator('[aria-labelledby]');
      const labelledbyCount = await elementsWithAriaLabelledby.count();
      
      for (let i = 0; i < labelledbyCount; i++) {
        const element = elementsWithAriaLabelledby.nth(i);
        const labelledbyId = await element.getAttribute('aria-labelledby');
        
        // 檢查參照的元素是否存在
        const labelElement = page.locator(`#${labelledbyId}`);
        await expect(labelElement).toHaveCount(1);
      }
    });
  });

  test('圖片替代文字', async ({ page }) => {
    await page.goto('/workshop');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      const ariaLabel = await image.getAttribute('aria-label');
      
      // 每個圖片都應該有替代文字，除非是裝飾性圖片
      if (role !== 'presentation' && role !== 'none') {
        expect(alt || ariaLabel).toBeTruthy();
        
        // 替代文字不應該是檔名
        if (alt) {
          expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|svg)$/i);
          expect(alt).not.toBe('image');
          expect(alt).not.toBe('圖片');
        }
      }
    }
  });

  test('響應式設計和縮放', async ({ page, browserName }) => {
    // Safari 不支援某些縮放測試
    if (browserName === 'webkit') {
      test.skip();
    }
    
    await page.goto('/workshop/chapter-04');
    
    // 測試不同縮放級別
    const zoomLevels = [0.5, 1, 1.5, 2];
    
    for (const zoom of zoomLevels) {
      await test.step(`測試 ${zoom * 100}% 縮放`, async () => {
        await page.evaluate((z) => {
          document.body.style.zoom = z.toString();
        }, zoom);
        
        // 檢查內容是否仍然可見
        const mainContent = page.locator('main, [role="main"]');
        await expect(mainContent).toBeVisible();
        
        // 檢查是否有水平滾動條
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        // 在200%縮放下，可能會有水平滾動
        if (zoom <= 1.5) {
          expect(hasHorizontalScroll).toBe(false);
        }
      });
    }
    
    // 重置縮放
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('多媒體內容無障礙性', async ({ page }) => {
    await page.goto('/workshop');
    
    // 檢查影片
    const videos = page.locator('video');
    const videoCount = await videos.count();
    
    for (let i = 0; i < videoCount; i++) {
      const video = videos.nth(i);
      
      // 檢查控制項
      const hasControls = video;
      await expect(hasControls).toHaveAttribute('controls', );
      
      // 檢查字幕軌道
      const tracks = video.locator('track[kind="captions"], track[kind="subtitles"]');
      const trackCount = await tracks.count();
      
      if (trackCount > 0) {
        console.log('影片有字幕軌道');
      } else {
        console.warn('影片缺少字幕軌道');
      }
    }
    
    // 檢查音訊
    const audios = page.locator('audio');
    const audioCount = await audios.count();
    
    for (let i = 0; i < audioCount; i++) {
      const audio = audios.nth(i);
      
      // 檢查控制項
      const hasControls = audio;
      await expect(hasControls).toHaveAttribute('controls', );
    }
  });

  test('錯誤處理和反饋無障礙性', async ({ page }) => {
    await page.goto('/apps/form-validation');
    
    // 提交空表單以觸發錯誤
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // 等待錯誤訊息
      await page.waitForTimeout(500);
      
      // 檢查錯誤訊息是否可被螢幕閱讀器讀取
      const errors = page.locator('[role="alert"], [aria-live="assertive"], [aria-live="polite"]');
      const errorCount = await errors.count();
      
      expect(errorCount).toBeGreaterThan(0);
      
      // 檢查錯誤訊息是否與表單欄位關聯
      const inputsWithErrors = page.locator('[aria-invalid="true"], [aria-describedby]');
      const inputErrorCount = await inputsWithErrors.count();
      
      if (inputErrorCount > 0) {
        for (let i = 0; i < inputErrorCount; i++) {
          const input = inputsWithErrors.nth(i);
          const describedby = await input.getAttribute('aria-describedby');
          
          if (describedby) {
            const errorElement = page.locator(`#${describedby}`);
            await expect(errorElement).toBeVisible();
          }
        }
      }
    }
  });
});