document.addEventListener('DOMContentLoaded', function(){
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.logo').forEach(function(logoLink){
    logoLink.addEventListener('click', function(e){
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
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
  var minsPerJob = 120;

  function setActive(btn){
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
  }
  function fmt(n){ return Math.round(n).toLocaleString('pl-PL'); }

  function animateValue(el, from, to, suffix, duration){
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
  }

  var lastHours = 0, lastMonthly = 0, lastYearly = 0;
  var hoursEl = document.getElementById('hoursVal');
  var moneyEl = document.getElementById('moneyVal');
  var yearEl = document.getElementById('yearVal');

  function calc(){
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
  }
  btnFront.addEventListener('click', function(){ minsPerJob = 40; setActive(btnFront); calc(); });
  btnBody.addEventListener('click', function(){ minsPerJob = 120; setActive(btnBody); calc(); });
  carsSlider.addEventListener('input', calc);
  rateSlider.addEventListener('input', calc);
  calc();

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
