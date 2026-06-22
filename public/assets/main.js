
(function(){
  var utmKeys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  var params = new URLSearchParams(window.location.search);
  var stored = {};
  utmKeys.forEach(function(key){
    var value = params.get(key) || localStorage.getItem("km_" + key) || "";
    if (params.get(key)) localStorage.setItem("km_" + key, value);
    stored[key] = value;
  });

  function pushEvent(name, payload){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({event:name}, payload || {}));
  }

  if (document.body.dataset.pageType === "region") {
    pushEvent("region_page_view", {region: document.querySelector("#lead-region") && document.querySelector("#lead-region").value});
  }
  pushEvent("ViewContent", {page_type: document.body.dataset.pageType || "website", page_path: window.location.pathname});

  document.querySelectorAll(".js-call").forEach(function(link){
    link.addEventListener("click", function(){
      var payload = {phone: link.getAttribute("href")};
      pushEvent("call_click", payload);
      pushEvent("Contact", payload);
    });
  });

  document.querySelectorAll("[data-scroll-form]").forEach(function(link){
    link.addEventListener("click", function(event){
      var target = document.querySelector("#lead-form");
      if (target) {
        event.preventDefault();
        target.scrollIntoView({behavior:"smooth", block:"start"});
        setTimeout(function(){ var first = target.querySelector("input:not(.hp),select"); if(first) first.focus(); }, 400);
      }
    });
  });

  function money(num){ return Math.round(num).toLocaleString("uk-UA"); }
  function calc(){
    var type = document.getElementById("calcType");
    var count = document.getElementById("calcCount");
    var fuel = document.getElementById("calcFuel");
    var km = document.getElementById("calcKm");
    if (!type || !count || !fuel || !km) return;
    document.getElementById("countVal").textContent = count.value;
    document.getElementById("fuelVal").textContent = fuel.value;
    document.getElementById("kmVal").textContent = km.value;
    var pricePerL = type.value === "car" ? 58 : 55;
    var fuelMonth = (Number(fuel.value) / 100) * (Number(km.value) * 1000) * Number(count.value);
    var savings = fuelMonth * pricePerL * 0.2;
    var subscription = Number(count.value) * 250;
    var roi = subscription ? (savings / subscription).toFixed(1) : "0";
    document.getElementById("calcResultNum").textContent = money(savings);
    document.getElementById("calcSubResult").textContent = "Підписка КМ-Трейд: " + money(subscription) + " грн/міс · ROI: " + roi + "x";
    var hidden = document.getElementById("lead-savings");
    if (hidden) hidden.value = money(savings) + " грн/міс";
    var cta = document.getElementById("calcCta");
    if (cta) cta.textContent = "Хочу заощадити " + money(savings) + " грн →";
  }
  ["calcType","calcCount","calcFuel","calcKm"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function(){ calc(); pushEvent("calculator_used", {field:id}); });
  });
  calc();

  var priceCars = document.getElementById("priceCars");
  var priceTotal = document.getElementById("priceTotal");
  function priceCalc(){
    if (!priceCars || !priceTotal) return;
    priceTotal.textContent = money(Math.max(1, Number(priceCars.value || 1)) * 250) + " грн/міс";
  }
  if (priceCars) priceCars.addEventListener("input", priceCalc);
  priceCalc();

  document.querySelectorAll(".lead-form").forEach(function(form){
    utmKeys.forEach(function(key){
      var field = form.querySelector("[name='" + key + "']");
      if (field) field.value = stored[key] || "";
    });
    form.addEventListener("submit", async function(event){
      event.preventDefault();
      if (form.querySelector(".hp") && form.querySelector(".hp").value) return;
      var data = Object.fromEntries(new FormData(form).entries());
      data.page = window.location.pathname;
      pushEvent("form_submit", {region:data.region || "", cars:data.cars || "", form_name:form.dataset.formName || "lead"});
      pushEvent("Lead", {region:data.region || "", cars:data.cars || "", form_name:form.dataset.formName || "lead"});
      try {
        await fetch("/api/lead", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)});
      } catch (error) {
        console.warn("Lead endpoint unavailable", error);
      }
      var notification = document.getElementById("notification");
      if (notification) {
        notification.classList.add("show");
        setTimeout(function(){ notification.classList.remove("show"); }, 4200);
      }
      form.reset();
      utmKeys.forEach(function(key){
        var field = form.querySelector("[name='" + key + "']");
        if (field) field.value = stored[key] || "";
      });
    });
  });

  var maxDepth = 0;
  window.addEventListener("scroll", function(){
    var doc = document.documentElement;
    var depth = Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100);
    [25,50,75,90].forEach(function(mark){
      if (depth >= mark && maxDepth < mark) {
        maxDepth = mark;
        pushEvent("scroll_depth", {percent:mark});
      }
    });
  }, {passive:true});
})();