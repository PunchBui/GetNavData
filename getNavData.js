const https = require('https')

const get = async (url) => {
  const options = {
    headers: {
      cookie: 'hasCookie=true'
    }
  }

  return new Promise((resolve, reject) => {
    https.get(url, options, (resp) => {
      let data = '';
    
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      resp.on('end', () => {
        resolve(data)
      });
    
    }).on("error", (err) => {
      reject()
      console.log("Error: " + err.message);
    })
  })
}

const getHeader = (table) => {
  const headerRowRx = /<tr><th>.*<\/th><\/tr>/g
  const removeUselessTag = /<tr>|<\/tr>|<th>/g
  const headerRow = table.match(headerRowRx)[0]
  const header = headerRow
    .replace(removeUselessTag, '')
    .split(/<\/th>/)
    .filter(item => Boolean(item))
    .map(item => item.trim())
 
  return header
}

const getBody = (table) => {
  const bodyRowRx = /<tr><th>.*<\/th><\/tr>|<tr>/g
  const removeUselessTag = /<td>/g
  const bodyRows = table
    .replace(bodyRowRx, '')
    .split(/<\/tr>/g)
    .filter(item => Boolean(item))
  const body = bodyRows.map(item => item
    .replace(removeUselessTag, '')
    .split(/<\/td>/)
    .filter(item => Boolean(item))
    .map(item => item.trim())
  )
  
  return body
}

const getTableData = (html) => {
  const table = html.match(/<tr>.*<\/tr>/g)[0]
  const columns = getHeader(table)
  const rows = getBody(table)
  const data = rows.map(row => {
    let _data = {}

    columns.forEach((column, index) => {
      _data = { ..._data, [column]: row[index] }
    })
  
    return _data
  })
  
  return data
}

const app = async () => {
  process.argv.shift()
  process.argv.shift()
  const nav = process.argv.join(" ")

  if (!nav) {
    return console.log('Please insert NAV')
  }

  const res = await get('https://codequiz.azurewebsites.net/')
  const data = getTableData(res)
  const result = data.find(item => item['Fund Name'] === nav)

  if (!result) {
    return console.log('Not Found.')
  }

  return console.log(result.Nav)
}

app()