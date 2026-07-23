function toggleQuarterField(){
  const isNew = document.getElementById('isNewSign').checked;
  document.getElementById('quarterField').style.display = isNew ? 'block' : 'none';
  calculateTax();
}

function calculateTax(){
  const widthEl = document.getElementById('width');
  const lengthEl = document.getElementById('length');
  const width = parseFloat(widthEl.value);
  const length = parseFloat(lengthEl.value);
  const category = document.getElementById('category').value;
  const isNewSign = document.getElementById('isNewSign').checked;
  const quarter = isNewSign ? (parseFloat(document.getElementById('quarter').value) || 1.0) : 1.0;

  const errorEl = document.getElementById('size-error');
  const validSize = Number.isFinite(width) && Number.isFinite(length) && width > 0 && length > 0;
  errorEl.style.display = (widthEl.value !== '' || lengthEl.value !== '') && !validSize ? 'block' : 'none';

  const area = validSize ? width * length : 0;
  const baseUnits = area > 0 ? Math.ceil(area / 500) : 0;

  let rate = 0;
  switch(category){
    case '1_b': rate = 5;  break;
    case '1_a': rate = 10; break;
    case '2_b': rate = 26; break;
    case '2_a': rate = 52; break;
    case '3_b': rate = 50; break;
    case '3_a': rate = 52; break;
  }

  const annualTax = baseUnits * rate;
  const proratedTax = annualTax * quarter;

  let finalTax = 0;
  let showNotice = false;
  if(proratedTax > 0){
    if(proratedTax < 200){ finalTax = 200; showNotice = true; }
    else{ finalTax = proratedTax; }
  }

  document.getElementById('area-result').innerText = area.toLocaleString(undefined,{maximumFractionDigits:1});
  document.getElementById('units-result').innerText = baseUnits.toLocaleString();
  document.getElementById('rate-result').innerText = rate;
  document.getElementById('final-tax').innerText = finalTax.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('min-tax-notice').style.display = showNotice ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', calculateTax);
