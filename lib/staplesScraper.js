const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

const cookies = [{
  name: 'cmapi_cookie_privacy',
  value: 'permit 1,2,3',
  domain: '.staples.com',
  path: '/',
  expires: 2618572938,
  size: 32,
  httpOnly: false,
  secure: false,
  session: false
},
{
  name: 'notice_gdpr_prefs',
  value: '0,1,2:',
  domain: '.staples.com',
  path: '/',
  expires: 2618572938,
  size: 23,
  httpOnly: false,
  secure: false,
  session: false
}]

async function autoScroll (page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0
      var distance = 100
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

async function scrapePages (page, browser) {
  await autoScroll(page)
  await autoScroll(page)

  const data = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll(' div.standard-type__product_tile'))

    return divs.map(div => {
      return div.innerHTML
    })
  })

  for (const element of data) {
    if ((!element.includes('Out of Stock') && !element.includes('Back-order')) && !element.includes('Discontinued')) {
      const $ = cheerio.load(element)

      const ans = {
        name: 'Staples',
        image: $('img').attr('data-srcset').split(' ')[0],
        link: 'https://www.staples.com' + $('a').attr('href')
      }

      await browser.close()
      return ans
    }
  }

  try {
    await page.evaluate(() => {
      const elements = document.getElementsByClassName('uiStyles__mmx_icon_caret_right uiStyles__text_dark_gray')

      elements[0].click()
    })
  } catch (err) {
    await browser.close()
    return null
  }

  return (scrapePages(page))
}

// Returns obj with properties .store, .link, .image, if no item is found it returns null
async function staplesScraper (item) {
  const browser = await puppeteer.launch({ slowMo: 10 })
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()

  await page.setUserAgent('Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 74.0.3729.169 Safari / 537.36')

  await page.goto('https://www.staples.com')

  await page.setCookie(...cookies)

  await page.waitFor('#searchInput')

  await page.type('#searchInput', item)

  await page.waitFor('#leftContainer > ul > div > li:nth-child(2) > a')

  await page.click('#leftContainer > ul > div > li:nth-child(2) > a')

  return scrapePages(page, browser)
}

module.exports = staplesScraper