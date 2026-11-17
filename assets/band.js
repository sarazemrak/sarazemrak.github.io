// Interactive salary band in the homepage hero.
// The band is illustrative: one grade from $62k to $88k, midpoint $75k.
(function () {
  var card = document.getElementById('band');
  if (!card) return;

  var MIN = 62000, MID = 75000, MAX = 88000;
  var AXIS_LO = 50000, AXIS_HI = 100000, X0 = 20, WIDTH = 360;

  var input = card.querySelector('input');
  var dot = card.querySelector('.dot');
  var note = card.querySelector('.note');
  var arrow = card.querySelector('.note-arrow');
  var svg = card.querySelector('svg');
  var out = {
    pay: card.querySelector('[data-out="pay"]'),
    pen: card.querySelector('[data-out="pen"]'),
    compa: card.querySelector('[data-out="compa"]'),
    cost: card.querySelector('[data-out="cost"]')
  };

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function render() {
    var pay = Number(input.value);
    var x = X0 + (pay - AXIS_LO) / (AXIS_HI - AXIS_LO) * WIDTH;
    var pen = (pay - MIN) / (MAX - MIN);
    var below = pay < MIN;

    dot.setAttribute('cx', x.toFixed(1));
    dot.style.fill = below ? 'var(--spark)' : 'var(--accent)';
    note.setAttribute('x', (x + 26).toFixed(1));
    // Sara's drawn arrow, scaled down so its tip lands just above the dot.
    arrow.setAttribute('transform', 'translate(' + (x + 3.7).toFixed(1) + ' 19.8) scale(0.051)');
    note.style.opacity = arrow.style.opacity = below ? 1 : 0;

    out.pay.textContent = money(pay);
    out.pen.textContent = below ? 'Below' : pen > 1 ? 'Above' : Math.round(pen * 100) + '%';
    out.compa.textContent = (pay / MID).toFixed(2);
    out.cost.textContent = money(Math.max(0, MIN - pay));
    input.setAttribute('aria-valuetext', money(pay));
    svg.setAttribute('aria-label', 'Salary band from ' + money(MIN) + ' to ' + money(MAX) +
      '. Role paid ' + money(pay) + (below ? ', below the range.' : pay > MAX ? ', above the range.' : ', inside the range.'));
  }

  input.addEventListener('input', render);
  render();
})();
