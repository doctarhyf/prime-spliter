const { join } = require("path");

const fs = require("fs");
const fsp = require("fs").promises;

const rounded = true;

async function readFileAsync(filePath) {
  try {
    // Use await to asynchronously read the file
    const content = await fsp.readFile(filePath, "utf-8");

    return content; // Optionally return the content
  } catch (error) {
    // Handle errors, e.g., file not found
    console.error("Error reading file:", error.message);
    throw error;
  }
}

function splitTotalSum(namesArray, totalSum) {
  let realSum;
  let reste;

  if (rounded) {
    realSum = totalSum;
    totalSum = Math.floor(totalSum / 1000) * 1000;
    reste = realSum - totalSum;
  }

  line();
  console.log("CDF is rounded: ", rounded);
  console.log(
    `Spliting '${totalSum}' CDF, into '${namesArray.length}' agents ... `
  );

  console.log(`Real sum : ${realSum} CDF, Rounded: ${totalSum} CDF`);

  console.log(`Reste: ${reste} CDF`);

  const numAgents = namesArray.length;

  if (numAgents <= 0 || totalSum <= 0) {
    console.error(
      "Invalid input. Both numAgents and totalSum should be positive integers."
    );
    return null;
  }

  const averageSplit = totalSum / numAgents;

  if (averageSplit * numAgents > totalSum) {
    console.error(
      "Invalid input. The average split for each agent exceeds the total sum."
    );
    return null;
  }

  const result = [];

  for (let i = 0; i < numAgents - 1; i++) {
    const randomOffset =
      Math.random() * (0.2 * averageSplit) - 0.1 * averageSplit; // Random offset between -10% and 10%
    let split = Math.floor(averageSplit + randomOffset);

    // Generate a random name using faker
    const currentName = namesArray[i]; //faker.name.findName();

    split = rounded ? Math.floor(split / 100) * 100 : split;
    result.push({ name: currentName, value: split });
    totalSum -= split;
  }

  // The last entry ensures that the sum is exactly totalSum
  result.push({
    name: namesArray[namesArray.length - 1], //faker.name.findName(),
    value: totalSum,
  });

  return { result: result, reste: reste };
}

function line(count = 50, nlt = true, nlb = false) {
  console.log([...Array(count).fill("-")].join(""));
}

function convertToCSV(data, addHeaders = false) {
  line(50);

  let names = [];
  let values = [];
  const headers = Object.keys(data[0]).join(",");

  let rows = data.map((item) => {
    names.push(Object.values(item)[0]);
    values.push(Object.values(item)[1]);
    return Object.values(item).join(",");
  });
  //if (valuesOnly) rows = data.map((item) => Object.values(item)[1]);
  let csv = "";
  if (addHeaders) csv = `${headers}\n`;
  csv += `${rows.join("\n")}`;

  return csv;
}

const parseNameFiles = (namesData) => {
  let names = namesData.split("\r\n");

  names = names.filter((it, i) => it !== "");
  const chIdx = names.findIndex((it, i) => it === "-");

  const namesCD = names.slice(0, chIdx);
  const namesZH = names.slice(chIdx + 1);
  const numTotAgents = namesCD.length + namesZH.length;

  const d = { namesCD: namesCD, namesZH: namesZH, numTotAgents: numTotAgents };

  return d;
};

function processNamesFileData(namesArray, amount) {
  const { result: splits, reste } = splitTotalSum(namesArray, amount);
  return { reste: reste, splits: splits };
}

function GetChineseSplits(namesZH, amountByPers) {
  return namesZH.map((it, i) => {
    let ch = { name: it, value: amountByPers };
    return ch;
  });
}

function showWelcomeMsg() {
  console.log(`Bonjour et bien venu a PRIME SPLIT. v1.0.0`);
  console.log(`\nex: " node . eqa 1628350 values " `);
  console.log(`Usage \n`);
  console.log(`node . <agentsNamesFile> <totAmount> [<colToShow>] [<nff>] \n`);
  console.log(
    `\t1) agentsNamesFile - The name file format that contains agents names (ex: eqa)`
  );

  console.log(`\n\t2) totAmount - Prime integer total amount (ex: 2413900)`);
  console.log(
    `\n\t3) colToShow - This value if supplied will select the CSV column to show, 'names' for names or 'values' for values only`
  );
  console.log(
    `\n\t4) nff - This option shows you a team names file format example`
  );
}

function showNamesFileFormatExample() {
  const fmt = `//Congolese names
MWENZ MBAY Patrick
NUMBI MUSONGO
MOKE MUTEBA Elie
NSENGA ILUNGA
KAPYA KILWA Chloe
OMBA
KABULO MUPEPETO
NGOY KALOMBO CELE
MUKUNA MUKENGESHAYI
KINYANYA KALENGA Junior
MUKAZ KAYOMBO
MBWALYA KALEMBWE
KAHILU LUFUMA
MUJINGA NKULU
EKOSAYI MONIMAMBO
MBAYO PANDA
BUKASA KAYEMBE
KATANGA
ILUNGA SHIMBA
KYUNGU MUTABA
FRANVALE

- //necessary to split chinese and congolese names

LOU JIA SHEN
`;

  console.log(fmt);
}

function showNamesFileFormatExample() {
  const fmt = `\n\tThe format example :\n\t1. Congolese 1\t\n\t2. Congolese 2\n\t.\n\t.\n\t.\n\t.N. Congole N\n\t\n-\n\tN+1. Chinese N+1\nNB:Dash caracter ' - ' is necessary to separate congolese and chinese staff!`;
  console.log(fmt);
}

function saveCSVToFile(csvString, filename) {
  fs.writeFileSync(filename, csvString, "utf8");
  console.log(`CSV data saved to ${filename}`);
}

function main() {
  showWelcomeMsg();

  const [, , file, amt, col, outcsv] = process.argv;

  let namesFilePath = file; //"eqd";
  let totAmount = parseInt(amt); //2413900;

  const COL_NAMES = "names";
  const COL_VALUES = "values";

  const showOnlyColumn = col;
  const outputFileName = outcsv;

  readFileAsync(namesFilePath)
    .then((namesData) => {
      const { namesCD, namesZH, numTotAgents } = parseNameFiles(namesData);
      const namesAll = [...namesCD, ...namesZH];
      const amountByPers = Math.ceil(
        Math.floor((totAmount / numTotAgents) * 100) / 100
      );
      const numChinois = namesZH.length;
      const totAmountChinois = amountByPers * numChinois;
      const amountCongolais = totAmount - totAmountChinois;
      const { splits: congoleseSplits } = processNamesFileData(
        namesCD,
        amountCongolais
      );
      let chineseSplits = GetChineseSplits(namesZH, amountByPers);

      let allSplits = [...congoleseSplits, ...chineseSplits];

      let csv = convertToCSV(allSplits);
      if (COL_NAMES === showOnlyColumn) {
        let m = allSplits.map((n, i) => `${n.name}\r\n`).join("");
        csv = m;
      }

      if (COL_VALUES === showOnlyColumn) {
        let m = allSplits.map((n, i) => `${n.value}\r\n`).join("");
        csv = m;
      }

      console.log(csv);
      saveCSVToFile(csv, namesFilePath + ".csv");
    })
    .catch((error) => {
      console.error(`Error occured!\n${error}`);
    });
}

main();
