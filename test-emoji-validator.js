#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple emoji regex
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|✅|❌|🎯|🔧|📊|🚀|⚠️|🔍|📋|💡|🎉|🚨|📈|📉|🔄|⭐|🏷️|📝|🔗|📱|💻|🖥️|⚡|🛠️|🎨|📦|🔒|🌐|📞|🎓|🤖|👥|📚|🔥|💎|🎪|🎭|🎨|🎯|🎲|🎳|🎮|🎰|🎱|🎸|🎹|🎺|🎻|🎼|🎵|🎶|🎤|🎧|📻|📺|📹|📷|📸|📼|💿|💾|💽|🖨️|⌨️|🖱️|🖲️|💡|🔦|🕯️|🪔|🔋|🔌|💻|🖥️|🖨️|⌨️|🖱️|🖲️|💽|💾|💿|📀|🧮|🎥|🎞️|📽️|🎬|📺|📷|📸|📹|📼|🔍|🔎|🕯️|💡|🔦|🏮|🪔|📔|📕|📖|📗|📘|📙|📚|📓|📒|📃|📜|📄|📰|🗞️|📑|🔖|🏷️|💰|💴|💵|💶|💷|💸|💳|🧾|💹|💱|💲|✉️|📧|📨|📩|📤|📥|📦|📫|📪|📬|📭|📮|🗳️|✏️|✒️|🖋️|🖊️|🖌️|🖍️|📝|💼|📁|📂|🗂️|📅|📆|🗒️|🗓️|📇|📈|📉|📊|📋|📌|📍|📎|🖇️|📏|📐|✂️|🗃️|🗄️|🗑️|🔒|🔓|🔏|🔐|🔑|🗝️|🔨|🪓|⛏️|⚒️|🛠️|🗡️|⚔️|🔫|🪃|🏹|🛡️|🪚|🔧|🪛|🔩|⚙️|🗜️|⚖️|🦯|🔗|⛓️|🪝|🧰|🧲|🪜|⚗️|🧪|🧫|🧬|🔬|🔭|📡|💉|🩸|💊|🩹|🩺|🚪|🛗|🪟|🪑|🛏️|🛋️|🪑|🚽|🪠|🚿|🛁|🪤|🪒|🧴|🧷|🧹|🧺|🧻|🪣|🧼|🪥|🧽|🧯|🛒|🚬|⚰️|🪦|⚱️|🗿|🪧|🏧|🚮|🚰|♿|🚹|🚺|🚻|🚼|🚾|🛂|🛃|🛄|🛅|⚠️|🚸|⛔|🚫|🚳|🚭|🚯|🚱|🚷|📵|🔞|☢️|☣️|⬆️|↗️|➡️|↘️|⬇️|↙️|⬅️|↖️|↕️|↔️|↩️|↪️|⤴️|⤵️|🔃|🔄|🔙|🔚|🔛|🔜|🔝|🛐|⚛️|🕉️|✡️|☸️|☯️|✝️|☦️|☪️|☮️|🕎|🔯|♈|♉|♊|♋|♌|♍|♎|♏|♐|♑|♒|♓|⛎|🔀|🔁|🔂|▶️|⏩|⏭️|⏯️|◀️|⏪|⏮️|🔼|⏫|🔽|⏬|⏸️|⏹️|⏺️|⏏️|🎦|🔅|🔆|📶|📳|📴|♀️|♂️|⚧️|✖️|➕|➖|➗|♾️|‼️|⁉️|❓|❔|❕|❗|〰️|💱|💲|⚕️|♻️|⚜️|🔱|📛|🔰|⭕|✅|☑️|✔️|❌|❎|➰|➿|〽️|✳️|✴️|❇️|©️|®️|™️|#️⃣|*️⃣|0️⃣|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|🔠|🔡|🔢|🔣|🔤|🅰️|🆎|🅱️|🆑|🆒|🆓|ℹ️|🆔|Ⓜ️|🆕|🆖|🅾️|🆗|🅿️|🆘|🆙|🆚|🈁|🈂️|🈷️|🈶|🈯|🉐|🈹|🈚|🈲|🉑|🈸|🈴|🈳|㊗️|㊙️|🈺|🈵|🔴|🟠|🟡|🟢|🔵|🟣|🟤|⚫|⚪|🟥|🟧|🟨|🟩|🟦|🟪|🟫|⬛|⬜|◼️|◻️|◾|◽|▪️|▫️|🔶|🔷|🔸|🔹|🔺|🔻|💠|🔘|🔳|🔲|🏁|🚩|🎌|🏴|🏳️|🏳️‍🌈|🏳️‍⚧️|🏴‍☠️/gu;

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const emojis = content.match(EMOJI_REGEX);
    
    if (emojis) {
      console.log(`❌ EMOJIS FOUND in ${filePath}:`);
      console.log(`   Count: ${emojis.length}`);
      console.log(`   Emojis: ${[...new Set(emojis)].join(' ')}`);
      
      // Show first few lines with emojis
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (emojis.some(emoji => line.includes(emoji))) {
          console.log(`   Line ${index + 1}: ${line.substring(0, 100)}...`);
        }
      });
      console.log('');
      return false;
    }
    return true;
  } catch (error) {
    return true; // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  let allClean = true;
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      // Skip hidden files and node_modules
      if (item.startsWith('.') && item !== '.github') continue;
      if (item === 'node_modules') continue;
      if (item === 'dist') continue;
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!scanDirectory(fullPath)) {
            allClean = false;
          }
        } else if (stat.isFile() && fullPath.endsWith('.md')) {
          if (!scanFile(fullPath)) {
            allClean = false;
          }
        }
      } catch (error) {
        // Skip files/dirs that can't be accessed
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return allClean;
}

console.log('🔍 Scanning for emojis in .md files...\n');

const isClean = scanDirectory('.');

console.log('\n' + '='.repeat(60));
if (isClean) {
  console.log('✅ NO EMOJIS FOUND in .md files');
} else {
  console.log('❌ EMOJIS FOUND in .md files - VIOLATION!');
}
console.log('='.repeat(60));

process.exit(isClean ? 0 : 1);
