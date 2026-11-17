// Interactive resume: a lens shows only the items tagged with that lane,
// and the tiles, timeline, before-and-after chart, spotlights, and toolkit follow it.
// Ctrl or Cmd click combines lanes. Share a pre-set link with ?lens=comp or ?lens=comp,data.
(function () {
  var LENSES = {
    comp: 'compensation', rewards: 'benefits and payroll', hr: 'HR and people',
    data: 'data and analytics', systems: 'HR systems', ops: 'operations'
  };

  var STATS = {
    all: [['8+ yrs', 'in compensation, HR, payroll, and data, across five employers', 'yrs'], ['4', "US states' employment law: CA, NY, OR, WA"],
      ['~45', 'firms in the regional salary survey I lead'], ['2', "master's degrees: an MBA and an MS in data science"]],
    comp: [['5', 'employers where I ran the annual review'], ['3', 'law firms where I built the pay bands'],
      ['~45', 'firms in the regional salary survey I lead'], ['~40', 'job classifications in the survey, with descriptions I write']],
    rewards: [['11%', "most recent renewal increase, against the provider's 19% Oregon average"], ['4', 'employers where I negotiated the benefits renewals'],
      ['1', 'benefits program built from nothing'], ['4', "states' payroll: CA, NY, OR, WA"]],
    hr: [['30%', 'drop in sales new-hire turnover in three months'], ['4', 'roles leading teams, up to four direct reports'],
      ['~1,500', 'applications run in Workday Recruiting in year one'], ['4', "states' employment law: CA, NY, OR, WA"]],
    data: [['30→95%', 'attorney time-entry compliance in six months'], ['+20%', 'revenue after my pricing recommendations'],
      ['1st', 'centralized data warehouse at the firm, which I architected'], ['5 yrs', 'of warranty records cleaned and forecast']],
    systems: [['ADP', 'implemented from the ground up'], ['1', 'applicant tracking system built on Claude'],
      ['Sole', 'administrator of the HR, payroll, and benefits platforms at Rizzo'], ['22', 'staff and attorneys trained through a NetDocuments migration']],
    ops: [['40 min', 'per payroll GL run, down from about 3 hours, still in use'], ['2', 'divisions led through ISO 9001 implementation'],
      ['IOLTA', 'trust compliance restored after a books rebuild'], ['2', 'office leases and build-outs managed']]
  };


  // Years run 2018 to 2027, so the track has nine equal columns.
  var Y0 = 2018, Y1 = 2027;
  var TIMELINE = [
    { role: 'AT', name: 'Alleviate Tax', title: 'Director of Operations', from: 2018.33, to: 2019.33, when: 'May 2018 to May 2019' },
    { role: 'NL', name: 'Norway Labs', title: 'Finance and HR Manager', from: 2019.33, to: 2021.75, when: 'May 2019 to Oct 2021' },
    { role: 'RL', name: 'Rose Law Firm', title: 'Office Administrator', from: 2021.75, to: 2023.33, when: 'Oct 2021 to May 2023' },
    { role: 'RB', name: 'Rizzo Bosworth', title: 'Firm Administrator', from: 2023.42, to: 2024.75, when: 'Jun 2023 to Oct 2024' },
    { role: 'MH', name: 'Markowitz Herbold', title: 'HR and Operations Admin.', from: 2024.83, to: 2026.67, when: 'Nov 2024 to Sep 2026' },
    { role: 'AL', name: 'ALA Oregon', title: 'Salary survey lead', from: 2024, to: 2026.9, when: 'Third year as lead' },
    { role: 'ED', name: 'Portland State', title: 'MBA and MS', from: 2020, to: 2023.45, when: '2020 to 2023, while working full time' }
  ];

  var BA = [
    { label: 'Attorney time-entry compliance', sub: 'Markowitz Herbold, six months', lens: 'data hr', max: 100,
      before: [30, '30%'], after: [95, '95%'] },
    { label: 'Payroll GL entries, per run', sub: 'Rizzo Bosworth, shorter is better', lens: 'data ops', max: 180,
      before: [180, 'about 3 hrs'], after: [40, 'about 40 min'] },
    { label: 'Gap between candidate follow-ups', sub: 'Markowitz Herbold, ATS built on Claude', lens: 'hr systems', max: 30,
      before: [30, 'a month+'], after: [7, 'weekly'] },
    { label: 'Sales new-hire turnover', sub: 'Alleviate Tax, indexed to 100, three months', lens: 'hr', max: 100,
      before: [100, '100'], after: [70, '70'] },
    { label: 'Revenue after pricing recommendations', sub: 'Norway Labs, indexed to 100, second year', lens: 'data ops', max: 120,
      before: [100, '100'], after: [120, '120'] }
  ];

  // Toolkit, strongest first. Each line says what was built with the tool.
  var KIT = [
    ['Core', [
      ['Power BI', 'data comp', 'People-cost reporting against revenue at Markowitz, built on my own SQL. The Cloud Adoption dashboard, with DAX.'],
      ['Excel and VBA', 'data comp', 'Advanced Excel with Power Query and Power Pivot. VBA automation for web-scraped pricing data, incentive payout reporting, and commission data pulls.'],
      ['SQL', 'data comp', 'SQL Server reporting built where no system existed at Rizzo. SQL against the time and billing system at Markowitz, feeding Power BI.'],
      ['HR and payroll platforms', 'systems rewards hr', 'ADP implemented from the ground up and run as sole administrator. Paychex, Paylocity, GNSA, and Workday Recruiting across other roles.'],
      ['Claude', 'systems data hr', 'Daily use for building working tools, including an applicant tracking system and the rules research behind my payroll app.']
    ]],
    ['Supporting', [
      ['Python and R', 'data', 'Graduate work and personal projects, including turnover modeling in R and a payroll rules app in Python.'],
      ['Power Automate', 'systems hr', 'Workflow automation at Norway Labs, Rizzo, and Markowitz, including an accepted-offer automation in Teams.'],
      ['Microsoft 365', 'systems ops', 'Teams, SharePoint, security groups, and file share permissions.'],
      ['Legal technology', 'systems ops', 'ProLaw and Clio administered at Rizzo. A NetDocuments migration and its access controls.']
    ]]
  ];

  // ---------- spotlight: one extra visual per lane ----------
  var ORDER = ['AT', 'NL', 'RL', 'RB', 'MH', 'AL'];
  var SHORT = { AT: 'Alleviate', NL: 'Norway Labs', RL: 'Rose', RB: 'Rizzo', MH: 'Markowitz', AL: 'ALA survey' };
  function chips(codes) {
    var sorted = codes.slice().sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
    return '<span class="chips">' + sorted.map(function (c) { return '<span class="chip">' + (SHORT[c] || c) + '</span>'; }).join('') + '</span>';
  }
  function cycle(steps) {
    return '<ol class="cycle">' + steps.map(function (st, i) {
      return '<li><span class="step-n">' + (i + 1) + '</span><div><b>' + st[0] + '</b><p>' + esc(st[1]) + '</p>' + chips(st[2]) + '</div></li>';
    }).join('') + '</ol>';
  }
  function gantt(rows) {
    var head = '<div class="tl-axis" aria-hidden="true"><span></span><div class="tl-track">';
    for (var y = Y0; y < Y1; y++) head += '<span class="tl-tick" style="left:' + pct(y + 0.5) + '">&#39;' + String(y).slice(2) + '</span>';
    return '<div class="timeline sys">' + head + '</div></div>' + rows.map(function (r) {
      return '<div class="tl-row"><span class="tl-name">' + r[0] + '</span><div class="tl-track">' + r[1].map(function (seg) {
        return '<span class="tl-bar" style="left:' + pct(seg[0]) + ';width:calc(' + pct(seg[1]) + ' - ' + pct(seg[0]) + ')" title="' + r[0] + '"></span>';
      }).join('') + '</div></div>';
    }).join('') + '</div>';
  }
  var AT_ = [2018.33, 2019.33], NL_ = [2019.33, 2021.75], RL_ = [2021.75, 2023.33], RB_ = [2023.42, 2024.75], MH_ = [2024.83, 2026.67];

  var SPOT = {
    comp: {
      title: 'The compensation cycle, end to end',
      sub: 'Each step, and where I have run it',
      html: function () {
        return cycle([
          ['Leveling and job architecture', 'Job evaluation and grading to level roles. Job titles and descriptions for the survey\'s 40 classifications.', ['RL', 'RB', 'MH', 'AL']],
          ['Market pricing and benchmarking', 'Every role checked against current market data, with at least two sources where possible, including the regional survey I lead.', ['AT', 'NL', 'RL', 'RB', 'MH', 'AL']],
          ['Pay bands', 'Bands built at three law firms. Pay ranges for new hires at Norway Labs.', ['NL', 'RL', 'RB', 'MH']],
          ['Budget modeling', 'Raises and bonuses modeled against budget.', ['NL', 'RL', 'RB', 'MH']],
          ['Annual merit cycle', 'The annual merit cycle run through owner, partner, and shareholder sign-off. Created the review process at Alleviate.', ['AT', 'NL', 'RL', 'RB', 'MH']],
          ['Variable and deferred pay', 'Bonus, commission, and incentive payouts. Phantom stock, deferred compensation, and partner distributions administered.', ['AT', 'NL', 'RL', 'RB', 'MH']]
        ]);
      }
    },
    rewards: {
      title: 'Benefits, leave, and payroll',
      sub: 'Programs I have run, and the most recent renewal result',
      html: function () {
        return '<div class="fact-grid">' +
          '<div class="fact"><b>Most recent renewal, Markowitz</b>' +
            '<div class="ba-row"><span>Oregon avg.</span><div class="ba-track"><div class="ba-fill" style="width:95%"></div></div><span>19%</span></div>' +
            '<div class="ba-row after"><span>Negotiated</span><div class="ba-track"><div class="ba-fill" style="width:55%"></div></div><span>11%</span></div>' +
            '<p class="fact-note">Annual premium increase. Lower is better.</p></div>' +
          '<div class="fact"><b>Renewals negotiated</b>' + chips(['NL', 'RL', 'RB', 'MH']) +
            '<b>Benefits program built from nothing</b><p>At Alleviate: carriers and broker selected, with three health and two dental options.</p></div>' +
          '<div class="fact"><b>Leave administered</b>' + chips(['FMLA', 'Oregon Family Leave', 'Paid Leave Oregon', 'Paid Leave Washington', 'State-approved equivalent plan']) +
            '<b>Payroll states</b>' + chips(['California', 'New York', 'Oregon', 'Washington']) + '</div>' +
        '</div>';
      }
    },
    hr: {
      title: 'The employee lifecycle, end to end',
      sub: 'Each stage, and where I have run it',
      html: function () {
        return cycle([
          ['Recruiting and selection', 'Full-cycle recruiting and structured, scored interviews, run through Workday Recruiting, Paylocity, and an applicant tracking system I built.', ['AT', 'RL', 'RB', 'MH']],
          ['Onboarding', 'Onboarding rebuilt with 30, 60, and 90 day check-ins. The hiring and onboarding process mapped from offer letter onward.', ['AT', 'RB', 'MH']],
          ['Performance and development', 'Performance management, annual reviews, mentoring, and professional development. One mentee now leads a finance team.', ['AT', 'NL', 'RL', 'RB']],
          ['Policy and compliance', 'Handbooks and HR policies, and employment compliance across California, New York, Oregon, and Washington.', ['AT', 'RL', 'RB', 'MH']],
          ['Employee relations', 'Pay, performance, promotion, and personnel matters worked through with leadership, including complex and sensitive cases.', ['RL', 'RB', 'MH']],
          ['Offboarding', 'Offboarding and terminations.', ['RL', 'RB']]
        ]);
      }
    },
    data: {
      title: 'From raw data to decisions',
      sub: 'What I work from, what I build with, and what changed',
      html: function () {
        function col(h, list) {
          return '<div class="flow-col"><b>' + h + '</b><ul>' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
        }
        return '<div class="flow">' +
          col('Sources', ['HR and payroll systems', 'Time and billing data', 'CRM warranty records', 'Web-scraped pricing data', 'Regional salary survey']) +
          '<span class="flow-arrow" aria-hidden="true">&rarr;</span>' +
          col('Tools', ['Power BI', 'SQL and SQL Server', 'Excel with Power Query and Power Pivot', 'VBA', 'Python and R']) +
          '<span class="flow-arrow" aria-hidden="true">&rarr;</span>' +
          col('What changed', ['Firm billing policy reshaped', 'Time-entry compliance from 30% to 95%', 'Revenue up 20% from pricing', 'A failing equipment line dropped', 'Pay and staffing decisions tied to billable hours']) +
        '</div>';
      }
    },
    systems: {
      title: 'Eight years in HR and business systems',
      sub: 'Platforms by year, 2018 to 2026',
      html: function () {
        return gantt([
          ['ADP', [[AT_[0], NL_[1]]]],
          ['Workday Recruiting', [[2018.33, 2018.83]]],
          ['Microsoft 365', [NL_, RB_]],
          ['Power Automate', [NL_, RB_, MH_]],
          ['Paylocity', [RL_]],
          ['NetDocuments', [RL_, RB_]],
          ['ProLaw', [RB_, MH_]],
          ['Clio', [RB_]],
          ['Paychex', [MH_]],
          ['Claude', [MH_]]
        ]);
      }
    }
  };

  function tags(el) { return (el.getAttribute('data-lens') || '').split(' '); }
  function hasAny(el, sel) { var t = tags(el); return sel.some(function (l) { return t.indexOf(l) > -1; }); }
  function pct(y) { return ((y - Y0) / (Y1 - Y0) * 100).toFixed(2) + '%'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function names(sel) {
    var n = sel.map(function (l) { return LENSES[l]; });
    return n.length < 3 ? n.join(' and ') : n.slice(0, -1).join(', ') + ', and ' + n[n.length - 1];
  }

  // ---------- unlisted Irish version: /resume/?for=ie ----------
  // Same page, with the location line swapped for the right-to-work line used on Irish CVs.
  // Nothing on the site links here, and the canonical tag keeps search on the plain page.
  var FOR = new URLSearchParams(window.location.search).get('for') === 'ie' ? 'ie' : '';
  if (FOR) {
    document.getElementById('loc').textContent = 'Right to work: US citizen relocating to Ireland, eligible for the Critical Skills Employment Permit.';
  }

  // ---------- build the charts once ----------
  var tl = document.getElementById('timeline');
  var axis = '<div class="tl-axis" aria-hidden="true"><span></span><div class="tl-track">';
  for (var y = Y0; y < Y1; y++) axis += '<span class="tl-tick" style="left:' + pct(y + 0.5) + '">\'' + String(y).slice(2) + '</span>';
  tl.innerHTML = axis + '</div></div>' + TIMELINE.map(function (r) {
    return '<div class="tl-row" data-role="' + r.role + '"><span class="tl-name">' + esc(r.name) + '<small>' + esc(r.title) +
      '</small></span><div class="tl-track"><span class="tl-bar" style="left:' + pct(r.from) + ';width:calc(' + pct(r.to) + ' - ' + pct(r.from) +
      ')" tabindex="0" data-role="' + r.role + '"></span></div></div>';
  }).join('');

  document.getElementById('ba').innerHTML = BA.map(function (b) {
    function row(cls, v, word) {
      return '<div class="ba-row ' + cls + '"><span>' + word + '</span><div class="ba-track"><div class="ba-fill" style="width:' +
        (v[0] / b.max * 100).toFixed(1) + '%"></div></div><span>' + esc(v[1]) + '</span></div>';
    }
    return '<div class="ba-item" data-lens="' + b.lens + '"><div class="ba-label">' + esc(b.label) + ' <small>· ' + esc(b.sub) +
      '</small></div>' + row('before', b.before, 'Before') + row('after', b.after, 'After') + '</div>';
  }).join('');

  document.getElementById('toolkit').innerHTML = KIT.map(function (g) {
    return '<div class="kit-group"><h3 class="kit-tier">' + g[0] + '</h3><ul class="kit">' + g[1].map(function (t) {
      return '<li data-lens="' + t[1] + '"><b>' + esc(t[0]) + '</b><span>' + esc(t[2]) + '</span></li>';
    }).join('') + '</ul></div>';
  }).join('');

  // ---------- tooltip on timeline bars ----------
  var tip = document.getElementById('tip');
  function showTip(e) {
    var bar = e.target.closest('.tl-bar[data-role]');
    if (!bar) return;
    var r = TIMELINE.filter(function (x) { return x.role === bar.getAttribute('data-role'); })[0];
    tip.innerHTML = '<b>' + esc(r.name) + '</b>' + esc(r.title) + '<br>' + esc(r.when);
    tip.hidden = false;
    var box = bar.getBoundingClientRect();
    var x = e.clientX || (box.left + box.width / 2);
    tip.style.left = Math.max(8, Math.min(window.innerWidth - tip.offsetWidth - 8, x - tip.offsetWidth / 2)) + 'px';
    tip.style.top = (box.top - tip.offsetHeight - 8) + 'px';
  }
  function hideTip() { tip.hidden = true; }
  tl.addEventListener('mousemove', showTip);
  tl.addEventListener('focusin', showTip);
  tl.addEventListener('mouseleave', hideTip);
  tl.addEventListener('focusout', hideTip);
  window.addEventListener('scroll', hideTip, { passive: true });

  // ---------- Everything shows the top four bullets per job ----------
  var TOP = 4;
  [].forEach.call(document.querySelectorAll('#exp-title ~ .role'), function (role) {
    var lis = role.querySelectorAll('li');
    if (lis.length <= TOP) return;
    [].forEach.call(lis, function (li, i) { if (i >= TOP) li.classList.add('more'); });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'show-all';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Show all ' + lis.length;
    btn.addEventListener('click', function () {
      var open = role.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show fewer' : 'Show all ' + lis.length;
    });
    role.appendChild(btn);
  });

  // ---------- apply the selected lanes ----------
  var items = [].slice.call(document.querySelectorAll('.role:not(.keep) li[data-lens], .skills > div[data-lens]'));
  var buttons = [].slice.call(document.querySelectorAll('.lens'));
  var status = document.getElementById('lens-status');
  var baFig = document.getElementById('ba').closest('figure');
  var current = [];

  function apply(sel) {
    sel = sel.filter(function (l, i) { return LENSES[l] && sel.indexOf(l) === i; });
    current = sel;
    var on = sel.length > 0;
    document.body.classList.toggle('lens-on', on);
    buttons.forEach(function (b) {
      var l = b.getAttribute('data-lens');
      b.setAttribute('aria-pressed', String(l === 'all' ? !on : sel.indexOf(l) > -1));
    });

    items.forEach(function (el) {
      var m = on && hasAny(el, sel);
      el.classList.toggle('match', m);
      el.classList.toggle('dim', on && !m);
    });

    var total = 0;
    [].forEach.call(document.querySelectorAll('.role[data-role]'), function (role) {
      var lis = role.querySelectorAll('li[data-lens]');
      var keep = role.classList.contains('keep');
      var n = on && !keep ? role.querySelectorAll('li.match').length : lis.length;
      total += on && !keep ? n : 0;
      role.classList.toggle('empty', on && n === 0);
      var row = tl.querySelector('.tl-row[data-role="' + role.getAttribute('data-role') + '"]');
      if (row) row.classList.toggle('off', on && n === 0);
    });
    document.getElementById('tl-sub').textContent = on
      ? 'Roles with ' + names(sel) + ' work'
      : 'Every role, 2018 to 2026';

    [].forEach.call(document.querySelectorAll('.ba-item, .kit li'), function (el) {
      el.classList.toggle('off', on && !hasAny(el, sel));
    });

    // Anything left with nothing to show is removed, headings and charts included.
    [].forEach.call(document.querySelectorAll('.kit-group'), function (g) {
      g.classList.toggle('is-empty', on && !g.querySelector('li:not(.off)'));
    });
    var baEmpty = on && !document.querySelector('.ba-item:not(.off)');
    baFig.classList.toggle('is-empty', baEmpty);
    [].forEach.call(document.querySelectorAll('.cv-two .section-title'), function (h) {
      var next = h.nextElementSibling;
      h.classList.toggle('is-empty', !!next && next.classList.contains('empty'));
    });
    var two = document.querySelector('.cv-two');
    two.classList.toggle('is-empty', on && !two.querySelector('.role:not(.empty)'));

    // One spotlight per selected lane. The first fills the space beside the
    // timeline when the before-and-after chart has nothing to show.
    [].forEach.call(document.querySelectorAll('.spot'), function (f) { f.remove(); });
    var spots = sel.filter(function (l) { return SPOT[l]; });
    var anchor = baFig;
    spots.forEach(function (l, i) {
      var f = document.createElement('figure');
      f.className = 'viz spot' + (i === 0 && baEmpty ? '' : ' wide');
      f.innerHTML = '<figcaption><span class="viz-title">' + SPOT[l].title + '</span><span class="viz-sub">' + SPOT[l].sub +
        '</span></figcaption><div>' + SPOT[l].html() + '</div>';
      anchor.after(f);
      anchor = f;
    });
    baFig.parentNode.classList.toggle('single', baEmpty && !spots.length);

    // Tiles: one lane shows its own four; combined lanes take turns.
    var tiles = [];
    var pools = on ? sel.map(function (l) { return STATS[l]; }) : [STATS.all];
    for (var i = 0; tiles.length < 4 && i < 4; i++) {
      pools.forEach(function (p) { if (p[i] && tiles.length < 4) tiles.push(p[i]); });
    }
    document.getElementById('stats').innerHTML = tiles.map(function (s) {
      return '<div class="stat' + (s[2] ? ' stat-yrs' : '') + '"><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>';
    }).join('');

    status.textContent = on ? 'Showing ' + total + ' items in ' + names(sel) + '.' : 'Showing everything.';

    // Built by hand so the comma stays readable in a shared link (?lens=comp,data).
    var q = [];
    if (FOR) q.push('for=' + FOR);
    if (on) q.push('lens=' + sel.join(','));
    history.replaceState(null, '', window.location.pathname + (q.length ? '?' + q.join('&') : '') + window.location.hash);
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function (e) {
      var l = b.getAttribute('data-lens');
      if (l === 'all') return apply([]);
      var picked = current.indexOf(l) > -1;
      if (e.ctrlKey || e.metaKey) {
        // Combine: add or remove this lane, keeping the others.
        apply(picked ? current.filter(function (x) { return x !== l; }) : current.concat(l));
      } else {
        apply(picked && current.length === 1 ? [] : [l]);
      }
    });
  });

  document.getElementById('print').addEventListener('click', function () { window.print(); });

  apply((new URLSearchParams(window.location.search).get('lens') || '').split(','));
})();
