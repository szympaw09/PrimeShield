document.addEventListener('DOMContentLoaded', function(){
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var navToggle = document.getElementById('navToggle');
  var mobileOverlay = document.getElementById('mobileMenuOverlay');
  if(navToggle && mobileOverlay){
    navToggle.addEventListener('click', function(){
      var isOpen = mobileOverlay.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileOverlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileOverlay.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        mobileOverlay.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  document.querySelectorAll('.logo').forEach(function(logoLink){
    logoLink.addEventListener('click', function(e){
      if(logoLink.getAttribute('href') === '#'){
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
      // w przeciwnym razie (np. href="index.html") pozwól na normalną nawigację
    });
  });

  // Hero: sekwencyjne pojawianie się od razu przy wejściu (nie czeka na scroll)
  var heroEls = document.querySelectorAll('.hero .reveal');
  if(prefersReduced){
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  } else {
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        heroEls.forEach(function(el){ el.classList.add('in'); });
      });
    });

    // Reszta strony: pojawianie się przy wjechaniu w widok
    var scrollEls = document.querySelectorAll('.reveal:not(.hero .reveal)');
    if('IntersectionObserver' in window){
      var revealIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('in');
            revealIO.unobserve(entry.target);
          }
        });
      }, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
      scrollEls.forEach(function(el){ revealIO.observe(el); });
    } else {
      scrollEls.forEach(function(el){ el.classList.add('in'); });
    }
  }

  // Powiadomienie o cookies — styl iOS, wjeżdża z dołu po chwili od wejścia
  try {
    var cookieToast = document.getElementById('cookieToast');
    if(cookieToast){
      var consent = localStorage.getItem('primeshield_cookie_consent_v2');
      if(!consent){
        setTimeout(function(){ cookieToast.classList.add('show'); }, prefersReduced ? 200 : 1000);
      }
      function dismissCookieToast(value){
        try { localStorage.setItem('primeshield_cookie_consent_v2', value); } catch(e){}
        cookieToast.classList.remove('show');
      }
      var btnNecessary = document.getElementById('cookieAcceptNecessary');
      if(btnNecessary){
        btnNecessary.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          dismissCookieToast('necessary');
        });
      }
    }
  } catch(e){ /* localStorage niedostępny — po prostu nie pokazujemy toastu */ }

  var monthNames = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
  var monthEl = document.getElementById('currentMonth');
  var today = new Date();
  if(monthEl){ monthEl.textContent = monthNames[today.getMonth()]; }

  var TOTAL_SLOTS = 10;
  var DAYS_BEFORE_END_FOR_LAST_SLOT = 3;

  var slotsTrack = document.getElementById('slotsTrack');
  var slotsFreeCount = document.getElementById('slotsFreeCount');
  if(slotsTrack && slotsFreeCount){
    var year = today.getFullYear();
    var month = today.getMonth();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var currentDay = today.getDate();
    var daysRemaining = daysInMonth - currentDay;

    // Zapełnianie liniowe: pełny miesiąc = 0 zajętych, DAYS_BEFORE_END_FOR_LAST_SLOT
    // dni przed końcem = 6 zajętych (1 wolne miejsce). Nigdy nie zamykamy ostatniego miejsca całkowicie.
    var span = daysInMonth - DAYS_BEFORE_END_FOR_LAST_SLOT;
    var elapsed = daysInMonth - daysRemaining;
    var rawFilled = span > 0 ? Math.round((elapsed / span) * (TOTAL_SLOTS - 1)) : (TOTAL_SLOTS - 1);
    var filled = Math.max(0, Math.min(TOTAL_SLOTS - 1, rawFilled));
    var free = TOTAL_SLOTS - filled;

    var slotEls = slotsTrack.querySelectorAll('.slot');
    slotEls.forEach(function(el, i){
      if(i < filled){ el.classList.add('filled'); }
      else { el.classList.remove('filled'); }
    });
    slotsFreeCount.textContent = free;
  }

  var carsSlider = document.getElementById('carsSlider');
  var rateSlider = document.getElementById('rateSlider');
  var btnFront = document.getElementById('btnFront');
  var btnBody = document.getElementById('btnBody');
  var segToggle = document.getElementById('segToggle');

  if(carsSlider && rateSlider && btnFront && btnBody){
    var minsPerJob = 120;

    var setActive = function(btn){
      [btnFront, btnBody].forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      if(segToggle){
        segToggle.classList.toggle('pos-1', btn === btnBody);
        var indicator = document.getElementById('segIndicator');
        if(indicator){
          indicator.classList.remove('squish');
          void indicator.offsetWidth;
          indicator.classList.add('squish');
        }
      }
    };
    var fmt = function(n){ return Math.round(n).toLocaleString('pl-PL'); };

    var animateValue = function(el, from, to, suffix, duration){
      if(prefersReduced || from === to){ el.textContent = fmt(to) + suffix; return; }
      var startTime = null;
      function step(timestamp){
        if(!startTime){ startTime = timestamp; }
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = fmt(from + (to - from) * eased) + suffix;
        if(progress < 1){ requestAnimationFrame(step); }
        else { el.textContent = fmt(to) + suffix; }
      }
      requestAnimationFrame(step);
    };

    var lastHours = 0, lastMonthly = 0, lastYearly = 0;
    var hoursEl = document.getElementById('hoursVal');
    var moneyEl = document.getElementById('moneyVal');
    var yearEl = document.getElementById('yearVal');

    var calc = function(){
      var jobs = parseInt(carsSlider.value,10);
      var rate = parseInt(rateSlider.value,10);
      document.getElementById('carsVal').textContent = jobs;
      document.getElementById('rateVal').textContent = rate + ' zł/h';
      var savedHours = (jobs*minsPerJob)/60;
      var monthly = savedHours*rate;
      var yearly = monthly*12;
      animateValue(hoursEl, lastHours, savedHours, ' h', 500);
      animateValue(moneyEl, lastMonthly, monthly, ' zł', 500);
      animateValue(yearEl, lastYearly, yearly, ' zł', 500);
      lastHours = savedHours; lastMonthly = monthly; lastYearly = yearly;
    };
    btnFront.addEventListener('click', function(){ minsPerJob = 40; setActive(btnFront); calc(); });
    btnBody.addEventListener('click', function(){ minsPerJob = 120; setActive(btnBody); calc(); });
    carsSlider.addEventListener('input', calc);
    rateSlider.addEventListener('input', calc);
    calc();
  }

  // Test czasu — suwak starzenia TPU vs PCU
  var tpuSlider = document.getElementById('tpuYearSlider');
  var tpuYearVal = document.getElementById('tpuYearVal');
  var tpuYellow = document.getElementById('tpuYellow');
  var tpuGloss = document.getElementById('tpuGloss');
  var tpuStains = document.getElementById('tpuStains');
  var tpuLeft = document.getElementById('tpuLeft');
  if(tpuSlider && tpuYearVal && tpuYellow && tpuGloss && tpuStains && tpuLeft){
    var yearWord = function(n){
      if(n === 1){ return 'rok'; }
      var lastTwo = n % 100;
      var lastDigit = n % 10;
      if(lastTwo >= 12 && lastTwo <= 14){ return 'lat'; }
      if(lastDigit >= 2 && lastDigit <= 4){ return 'lata'; }
      return 'lat';
    };
    var updateTpu = function(){
      var rawYear = parseFloat(tpuSlider.value);
      var displayYear = Math.round(rawYear);
      tpuYearVal.textContent = displayYear + ' ' + yearWord(displayYear);
      var progress = (rawYear - 1) / 14;
      var fillPct = (progress * 100).toFixed(1) + '%';
      tpuSlider.style.setProperty('--tpu-fill', fillPct);
      // delikatne żółknięcie i lekka utrata połysku
      tpuYellow.style.opacity = (progress * 0.38).toFixed(2);
      tpuGloss.style.opacity = (1 - progress * 0.45).toFixed(2);
      tpuLeft.style.filter = 'saturate(' + (1 - progress * 0.12).toFixed(2) + ') brightness(' + (1 - progress * 0.04).toFixed(2) + ')';
      // widoczne plamy — narastają dopiero po 10. roku
      var stainProgress = rawYear <= 10 ? 0 : (rawYear - 10) / 5;
      tpuStains.style.opacity = (stainProgress * 0.55).toFixed(2);
    };
    tpuSlider.addEventListener('input', updateTpu);
    tpuSlider.addEventListener('change', updateTpu);
    tpuSlider.addEventListener('touchstart', function(){ requestAnimationFrame(updateTpu); }, {passive:true});
    tpuSlider.addEventListener('touchmove', function(){ requestAnimationFrame(updateTpu); }, {passive:true});
    tpuSlider.addEventListener('touchend', function(){ requestAnimationFrame(updateTpu); }, {passive:true});
    updateTpu();
  }

  var toggleRows = document.getElementById('toggleRows');
  var toggleLabel = document.getElementById('toggleLabel');
  var priceTableBody = document.getElementById('priceTableBody');
  if(toggleRows && priceTableBody){
    var extraRows = priceTableBody.querySelectorAll('tr.row-extra');
    var isOpen = false;
    var ROW_STAGGER = 0.05;

    toggleRows.addEventListener('click', function(){
      isOpen = !isOpen;
      toggleRows.classList.toggle('open', isOpen);
      toggleLabel.textContent = isOpen ? 'Pokaż mniej' : 'Zobacz pełną listę';

      if(isOpen){
        extraRows.forEach(function(row, i){
          row.style.transitionDelay = prefersReduced ? '0s' : (i * ROW_STAGGER) + 's';
          row.classList.add('pre-show');
        });
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            extraRows.forEach(function(row){ row.classList.add('show'); });
          });
        });
      } else {
        extraRows.forEach(function(row){
          row.classList.remove('pre-show', 'show');
          row.style.transitionDelay = '0s';
        });
      }
    });
  }

  function isValidNIP(raw){
    var nip = (raw || '').replace(/\D/g,'');
    if(nip.length !== 10) return false;
    var weights = [6,5,7,2,3,4,5,6,7];
    var sum = 0;
    for(var i=0;i<9;i++){ sum += parseInt(nip[i],10) * weights[i]; }
    var checksum = sum % 11;
    if(checksum === 10) return false;
    return checksum === parseInt(nip[9],10);
  }

  var nipInput = document.getElementById('f-nip');
  var applyForm = document.getElementById('applyForm');
  var applyError = document.getElementById('applyError');
  var applySuccess = document.getElementById('applySuccess');
  var priceGate = document.getElementById('priceGate');
  var priceTable = document.getElementById('priceTable');

  if(applyForm){
    applyForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!isValidNIP(nipInput.value)){
        applyError.classList.add('show');
        nipInput.focus();
        return;
      }
      applyError.classList.remove('show');
      var rodoCheckbox = document.getElementById('f-rodo');
      var rodoError = document.getElementById('rodoError');
      if(rodoCheckbox && !rodoCheckbox.checked){
        if(rodoError){ rodoError.classList.add('show'); }
        rodoCheckbox.focus();
        return;
      }
      if(rodoError){ rodoError.classList.remove('show'); }
      priceTable.classList.add('unlocked');
      priceGate.classList.add('hidden');
      applyForm.style.display = 'none';
      applySuccess.classList.add('show');
    });
    nipInput.addEventListener('input', function(){
      applyError.classList.remove('show');
    });
    var rodoCheckboxEl = document.getElementById('f-rodo');
    if(rodoCheckboxEl){
      rodoCheckboxEl.addEventListener('change', function(){
        var rodoError = document.getElementById('rodoError');
        if(rodoError){ rodoError.classList.remove('show'); }
      });
    }
  }
});
