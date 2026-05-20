import nlp from 'compromise';
const text = "Apple announced a major new update to its operating system today, introducing advanced AI capabilities. The company's stock rose significantly after the event. Users are excited about the new features.";

function getShortBullet(text: string) {
  let doc = nlp(text).sentences().first();
  doc.remove('#Adjective');
  doc.remove('#Adverb');
  doc.remove('(#Preposition|#Conjunction)');
  doc.remove('#Determiner');
  let words = doc.terms().out('array').filter(x => x.length > 0).slice(0, 5).join(' ');
  return words.length > 5 ? words.charAt(0).toUpperCase() + words.slice(1) : text.split('.')[0].substring(0, 50) + '...';
}

console.log(getShortBullet("The Federal Reserve decided to keep interest rates steady at 5.25%, but hinted at potential cuts later this year as inflation cools."));
console.log(getShortBullet("SpaceX successfully launched its newest rocket into orbit carrying a payload of 50 Starlink satellites."));


