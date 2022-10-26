export const unqoute = str => str.replace(/^['"]/g, '').replace(/['"]$/g, '');

export const quote = str => `'${str}'`;

export const getCssLink = (font) => {
  let url = 'https://fonts.googleapis.com/css2?family=';
  url += font.family.replace(/ /g, '+');
  url += ':ital,wght@';

  let weight, tupleList = [];
  for (const variant of font.variants) {
    weight = variant.match(/^(regular|italic)$/) ? '400' : variant.replace(/italic/g, '');
    tupleList.push(`${Number(variant.endsWith('italic'))},${weight}`)
  }

  url += tupleList.sort().join(";");

  return url;
}