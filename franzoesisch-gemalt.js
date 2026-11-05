/*
 * franzoesisch-gemalt.js - wo in Margots gemalten Geschichten was steht.
 *
 * Geschrieben von scripts/englisch-bilder-abgleich.py --sprache franzoesisch
 * - nicht von Hand ändern. Die Bilder liegen in bilder/franzoesisch/. Die
 * Wimmelbilder, Sticker und Aufnäher teilt der Französischwagen mit dem
 * Englischwagen (englisch-gemalt.js); gemalt eigen sind nur die Geschichten,
 * auf denen Margot steht. Wie es gelesen wird: englisch-art.js,
 * geschichtenGemalt (über train-franzoesischecke.js, gemalt).
 *   GESCHICHTEN[g][i][wort]   [[bx, by, bw, bh], ...]
 */
(() => {
"use strict";
const GESCHICHTEN = {
  ball: [{"tree":[[336.0,86.0,93.9,118.0]],"raccoon":[[141.9,46.9,76.7,135.4]],"ball":[[184.3,111.8,21.7,21.7]]},{"raccoon":[[131.9,62.9,65.9,118.6]],"ball":[[310.8,20.8,19.8,19.8]]},{"tree":[[250.7,7.3,146.6,196.7]],"ball":[[333.0,38.0,22.0,22.0]],"raccoon":[[118.3,77.8,61.2,108.0]]},{"raccoon":[[86.5,67.8,66.0,108.1]],"dog":[[192.3,40.1,116.8,93.4]]}],
  cat: [{"raccoon":[[162.4,39.4,76.7,135.4]]},{"bed":[[168.8,45.8,269.1,112.7]]},{"sofa":[[183.5,68.5,232.0,100.0]]},{"box":[[223.5,91.2,136.6,84.2]],"cat":[[259.9,73.3,60.2,39.3]]}],
  hungry: [{"raccoon":[[202.2,38.5,76.3,134.9]]},{"banana":[[277.4,134.4,74.5,41.4]]},{"bread":[[226.3,121.9,81.7,49.4]],"cheese":[[332.7,134.0,65.0,35.2]]},{"cake":[[243.0,79.1,121.2,99.0]]}],
  kite: [{"kite":[[100.0,27.0,71.9,105.6]],"raccoon":[[220.4,57.4,67.3,118.8]]},{"kite":[[89.7,0.2,46.1,69.9]]},{"tree":[[72.7,31.3,131.6,172.7]],"kite":[[120.3,34.8,60.9,104.7]]},{"kite":[[195.0,60.2,73.3,69.7]],"squirrel":[[134.7,74.0,77.5,84.6]]}],
  elephant: [{"monkey":[[83.2,22.2,124.6,125.1]],"raccoon":[[279.7,70.4,81.5,118.8]]},{"giraffe":[[255.1,3.2,94.1,167.0]]},{"raccoon":[[92.8,68.3,61.2,108.0]]},{"elephant":[[250.0,52.5,142.7,121.3]],"raccoon":[[75.0,79.8,66.0,108.1]]}],
  wave: [{"raccoon":[[99.7,54.4,68.8,121.5]],"sandcastle":[[246.5,92.7,84.0,86.4]]},{"crab":[[329.2,120.5,75.4,58.7]]},{"wave":[[228.0,46.4,238.5,131.3]]},{"sandcastle":[[210.6,108.3,58.8,60.5]],"crab":[[293.7,124.6,66.7,51.9]]}],
  schoolbus: [{"raccoon":[[180.9,71.4,77.4,112.6]]},{"schoolbus":[[60.7,73.2,205.1,97.9]]},{"schoolbus":[[68.7,72.7,193.6,93.4]],"trafficlight":[[382.7,70.6,31.7,133.4]]},{"trafficlight":[[44.2,80.6,27.7,122.8]],"schoolbus":[[222.9,52.0,206.4,112.6]]}],
  school: [{"backpack":[[50.2,80.6,60.2,92.8]],"raccoon":[[151.7,50.9,88.0,128.3]]},{"raccoon":[[102.2,59.4,88.0,128.3]],"teacher":[[346.4,36.7,53.8,156.2]]},{"paper":[[188.0,102.0,124.0,32.0]],"crayon":[[248.0,56.6,70.5,68.6]]},{"paper":[[232.7,44.3,57.6,74.4]],"teacher":[[300.1,40.5,132.1,151.3]]}],
  birthday: [{"raccoon":[[196.1,46.7,83.0,136.2]],"partyhat":[[215.1,14.2,52.8,76.6]]},{"present":[[164.5,84.2,43.8,44.3]]},{"cake":[[211.5,38.0,131.8,107.7]],"candle":[[235.5,30.5,83.3,52.6]]},{"raccoon":[[86.9,15.8,59.4,158.4]],"confetti":[[181.3,12.4,67.7,66.3]],"balloon":[[402.7,1.8,57.7,83.7]]}],
  washup: [{"raccoon":[[201.4,23.4,81.4,143.7]],"hands":[[192.6,88.0,86.8,35.0]]},{"teeth":[[152.3,18.5,259.4,132.9]]},{"hair":[[135.0,16.7,82.5,51.3]]},{"raccoon":[[179.1,64.5,270.4,55.5],[230.5,101.0,23.7,12.7]]}],
  rain: [{"raccoon":[[208.9,63.9,67.3,118.8]],"tshirt":[[209.8,117.4,58.3,41.6]]},{"rain":[[148.9,81.5,83.2,94.4]],"cloud":[[121.6,8.1,130.6,85.3]]},{"raccoon":[[195.3,66.8,61.2,108.0]],"coat":[[192.2,119.5,56.2,44.6]],"boots":[[194.9,153.9,48.2,25.0]]},{"rainbow":[[241.9,68.1,181.4,109.6]]}],
};
window.LernappFranzoesischGemalt = {
  ordner: "bilder/franzoesisch",
  geschichten: Object.fromEntries(Object.entries(GESCHICHTEN).map(([g, bilder]) => [g, bilder.map((woerter) => ({ woerter }))])),
};
})();
