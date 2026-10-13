/* ARKS ONE starter store.
   Demo mode: cart/products use this browser's localStorage; orders are sent as a WhatsApp message.
   Before real launch, connect a shared database, secure authentication, stock checks and payment provider. */
const STORE = {
  // Replace with your WhatsApp number including country code, digits only. Example India: 919876543210
  whatsappNumber: "919080530930",
  currency: "INR"
};
const categories = [
  {name:"Electronics",icon:"🎧"},
  {name:"Fashion",icon:"👕"},
  {name:"Home & Kitchen",icon:"🏡"},
  {name:"Beauty & Lifestyle",icon:"✨"},
  {name:"Smart Home",icon:"💡"},
  {name:"CCTV & Security",icon:"📹"},
  {name:"Networking",icon:"📡"},
  {name:"Construction",icon:"🏗️"},
  {name:"Tools & Accessories",icon:"🧰"}
];
const starterProducts = [
  {id:"p1",name:"Wireless Earbuds",category:"Electronics",price:799,emoji:"🎧",description:"Everyday wireless audio companion.",tag:"POPULAR"},
  {id:"p2",name:"Fast Charging Cable",category:"Electronics",price:199,emoji:"🔌",description:"Charging accessory for compatible devices.",tag:"ESSENTIAL"},
  {id:"p3",name:"Everyday Backpack",category:"Fashion",price:699,emoji:"🎒",description:"A practical bag for work and travel.",tag:"FEATURED"},
  {id:"p4",name:"Classic T-Shirt",category:"Fashion",price:399,emoji:"👕",description:"Comfortable everyday casual wear.",tag:"NEW"},
  {id:"p5",name:"Kitchen Storage Set",category:"Home & Kitchen",price:499,emoji:"🥣",description:"Keep kitchen essentials organised.",tag:"HOME"},
  {id:"p6",name:"Insulated Water Bottle",category:"Home & Kitchen",price:349,emoji:"🧴",description:"Reusable bottle for everyday use.",tag:"POPULAR"},
  {id:"p7",name:"Personal Care Kit",category:"Beauty & Lifestyle",price:299,emoji:"🧼",description:"A simple daily-care essentials set.",tag:"ESSENTIAL"},
  {id:"p8",name:"Smart LED Bulb",category:"Smart Home",price:549,emoji:"💡",description:"Smart lighting; check compatibility first.",tag:"SMART"},
  {id:"p9",name:"2MP CCTV Camera",category:"CCTV & Security",price:1299,emoji:"📹",description:"Security camera; installation sold separately.",tag:"SECURITY"},
  {id:"p10",name:"Wi-Fi Router",category:"Networking",price:1499,emoji:"📡",description:"Home networking; check coverage needs.",tag:"TECH"},
  {id:"p11",name:"Tool Kit",category:"Tools & Accessories",price:599,emoji:"🧰",description:"Handy tools for basic household tasks.",tag:"UTILITY"},
  {id:"p12",name:"Construction Service Enquiry",category:"Construction",price:0,emoji:"🏗️",description:"Ask us for a quote for construction or repairs.",tag:"SERVICE"}
];
const $ = (s) => document.querySelector(s);
const money = (n) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
const load = (key,fallback) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } };
let products = load("arks_products",starterProducts);
let cart = load("arks_cart",[]);
let activeCategory = "All";
let toastTimer;
function save(){localStorage.setItem("arks_products",JSON.stringify(products));localStorage.setItem("arks_cart",JSON.stringify(cart));}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCategories(){
  $("#categoryList").innerHTML=categories.slice(0,6).map(c=>`<button class="category-card ${activeCategory===c.name?"active":""}" data-category="${safe(c.name)}"><span class="category-icon">${c.icon}</span><strong>${safe(c.name)}</strong></button>`).join("");
  $("#categoryFilter").innerHTML='<option value="All">All categories</option>'+categories.map(c=>`<option value="${safe(c.name)}">${safe(c.name)}</option>`).join("");
  $("#adminCategory").innerHTML=categories.map(c=>`<option value="${safe(c.name)}">${safe(c.name)}</option>`).join("");
  $("#categoryFilter").value=activeCategory;
}
function productImage(p){
  if(p.image_url) return p.image_url;
  const name=String(p.name||"").toLowerCase();
  // Public sample photos used only when a product has no image_url. Replace with official supplier photos for exact models.
  if(name.includes("earbud")) return "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85";
  if(name.includes("bulb")) return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85";
  if(name.includes("cable")) return "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=900&q=85";
  return "";
}
function renderProducts(){
  let list=[...products];const q=$("#searchInput").value.trim().toLowerCase();const cat=$("#categoryFilter").value;
  if(cat!=="All")list=list.filter(p=>p.category===cat);if(q)list=list.filter(p=>(p.name+" "+p.description+" "+p.category).toLowerCase().includes(q));
  const sort=$("#sortFilter").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
  $("#productSummary").textContent=`${list.length} item${list.length===1?"":"s"}`;
  $("#productGrid").innerHTML=list.map(p=>{const image=productImage(p);const original=Number(p.original_price)||0;const discount=original>Number(p.price)&&original>0?Math.round((original-Number(p.price))*100/original):0;return `<article class="product-card" data-product-detail="${safe(p.id)}" tabindex="0" role="button" aria-label="View details for ${safe(p.name)}"><div class="product-visual"><span class="product-tag">${safe(p.tag||p.category)}</span>${image?`<img class="product-image" src="${safe(image)}" alt="${safe(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling?.classList.remove('hidden')"><span class="emoji hidden">${safe(p.emoji||"📦")}</span>`:`<span class="emoji">${safe(p.emoji||"📦")}</span>`}</div><div class="product-info"><span class="product-category">${safe(p.category)}</span><h3>${safe(p.name)}</h3><div class="product-description">${safe(p.description||"")}</div><div class="product-bottom"><span class="price">${Number(p.price)===0?"Ask for quote":money(p.price)}</span><button class="add-button" data-add="${safe(p.id)}" type="button">${Number(p.price)===0?"Enquire":"Add +"}</button></div></div></article>`}).join("");
  $("#emptyState").classList.toggle("hidden",list.length!==0);
}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((sum,i)=>sum+i.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map(item=>{const p=products.find(x=>x.id===item.id)||item.product;return `<div class="cart-item"><div class="cart-item-emoji">${safe(p.emoji||"📦")}</div><div><h4>${safe(p.name)}</h4><p>${money(p.price)}</p><div class="qty-controls"><button data-qty="${safe(p.id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${safe(p.id)}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-button" data-remove="${safe(p.id)}">Remove</button></div>`}).join(""):'<div class="empty-state">Your cart is empty.<br>Add a product to get started.</div>';
  $("#cartTotal").textContent=money(cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id)||item.product;return sum+(Number(p.price)||0)*item.qty;},0));
}
function openModal(id){$("#"+id).classList.remove("hidden");document.body.style.overflow="hidden";}
function closeModal(id){$("#"+id).classList.add("hidden");if(!document.querySelector(".modal-backdrop:not(.hidden),.drawer-backdrop:not(.hidden)"))document.body.style.overflow="";}


function variantValues(p, key){
  const raw = p[key] ?? p[key === "sizes" ? "size_options" : "color_options"] ?? "";
  if(Array.isArray(raw)) return raw.map(v=>String(v).trim()).filter(Boolean);
  if(typeof raw === "string" && raw.trim()) return raw.split(/[,|;]/).map(v=>v.trim()).filter(Boolean);
  return [];
}
function fillVariantSelect(id, values, placeholder, groupId){
  const select=$("#"+id), group=$("#"+groupId);
  if(!select||!group)return;
  if(!values.length){group.classList.add("hidden");select.innerHTML=`<option value="">${placeholder}</option>`;return;}
  group.classList.remove("hidden");
  select.innerHTML=`<option value="">${placeholder}</option>`+values.map(v=>`<option value="${safe(v)}">${safe(v)}</option>`).join("");
  select.value="";
}
function openProductDetails(id){
  const p=products.find(x=>String(x.id)===String(id));if(!p)return;
  const modal=$("#productDetailsModal"),img=$("#detailProductImage"),image=productImage(p);
  $("#detailProductName").textContent=p.name||"Product";
  $("#detailProductCategory").textContent=p.category||"";
  $("#detailProductDescription").textContent=p.description||"Product details will be updated soon.";
  $("#detailProductPrice").textContent=Number(p.price)===0?"Ask for quote":money(p.price);
  const original=Number(p.original_price)||0;
  $("#detailOriginalPrice").textContent=original>Number(p.price)?money(original):"";
  $("#detailDiscount").textContent=original>Number(p.price)?`${Math.round((original-Number(p.price))*100/original)}% OFF`:"";
  const stock=Number(p.stock_quantity);
  $("#detailProductStock").textContent=Number.isFinite(stock)?(stock>0?`In stock: ${stock} available`:"Stock availability: please enquire"):"Stock availability: please enquire";
  img.src=image||"";img.alt=p.name||"Product image";img.style.display=image?"block":"none";
  $("#detailImageZoom").style.display=image?"flex":"none";
  const category=String(p.category||"").toLowerCase();
  let sizes=variantValues(p,"sizes");
  let colors=variantValues(p,"colors");
  if(!sizes.length && /(fashion|clothing|apparel|shoe|footwear)/.test(category)) sizes=["XS","S","M","L","XL","XXL"];
  if(!colors.length && /(fashion|clothing|apparel|shoe|footwear)/.test(category)) colors=["Black","White","Blue","Red","Green"];
  fillVariantSelect("detailProductSize",sizes,"Select size","detailSizeGroup");
  fillVariantSelect("detailProductColor",colors,"Select colour","detailColorGroup");
  $("#detailAddToCart").textContent=Number(p.price)===0?"Enquire on WhatsApp":"Add to Cart";
  $("#detailAddToCart").onclick=()=>{
    const size=$("#detailProductSize")?.value||"";
    const color=$("#detailProductColor")?.value||"";
    if(sizes.length&&!size){toast("Please select a size.");return;}
    if(colors.length&&!color){toast("Please select a colour.");return;}
    const selected=[size?`Size: ${size}`:"",color?`Colour: ${color}`:""].filter(Boolean).join(" · ");
    if(selected)toast(`Selected ${selected}.`);
    addToCart(String(p.id));
    if(Number(p.price)!==0)closeProductDetails();
  };
  $("#detailWhatsApp").onclick=()=>{
    const size=$("#detailProductSize")?.value||"";
    const color=$("#detailProductColor")?.value||"";
    const selected=[size?`Size: ${size}`:"",color?`Colour: ${color}`:""].filter(Boolean).join("\n");
    if(sizes.length&&!size){toast("Please select a size.");return;}
    if(colors.length&&!color){toast("Please select a colour.");return;}
    sendWhatsApp(`Hello ARKS ONE, I would like to enquire about ${p.name}.\n${selected}\nPrice: ${Number(p.price)===0?"Please quote":money(p.price)}. Please share availability.`);
  };
  modal.classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeProductDetails(){const modal=$("#productDetailsModal");if(modal)modal.classList.add("hidden");if(!document.querySelector(".modal-backdrop:not(.hidden),.drawer-backdrop:not(.hidden),.video-modal:not(.hidden),.image-zoom-modal:not(.hidden)"))document.body.style.overflow="";}

function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;if(Number(p.price)===0){sendWhatsApp(`Hello ARKS ONE, I would like to enquire about: ${p.name}`);return;}const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});save();renderCart();toast("Added to your cart.");}
function sendWhatsApp(message){
  if(!STORE.whatsappNumber||STORE.whatsappNumber.includes("REPLACE")){toast("Set your WhatsApp number in app.js before using order links.");return;}
  const url=`https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;window.open(url,"_blank","noopener");
}
$("#categoryList").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;$("#categoryFilter").value=activeCategory;renderCategories();renderProducts();$("#shop").scrollIntoView({behavior:"smooth"});});
$("#productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b){e.stopPropagation();addToCart(b.dataset.add);return;}const card=e.target.closest("[data-product-detail]");if(card)openProductDetails(card.dataset.productDetail);});
$("#productGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-product-detail]")){e.preventDefault();openProductDetails(e.target.dataset.productDetail);}});
document.querySelector("[data-product-close]")?.addEventListener("click",closeProductDetails);
$("#productDetailsModal")?.addEventListener("click",e=>{if(e.target.id==="productDetailsModal")closeProductDetails();});
$("#detailImageZoom")?.addEventListener("click",()=>{const source=$("#detailProductImage").src;if(!source)return;$("#zoomedProductImage").src=source;$("#zoomedProductImage").alt=$("#detailProductImage").alt;$("#imageZoomModal").classList.remove("hidden");});
document.querySelector("[data-zoom-close]")?.addEventListener("click",()=>$("#imageZoomModal").classList.add("hidden"));
$("#imageZoomModal")?.addEventListener("click",e=>{if(e.target.id==="imageZoomModal")$("#imageZoomModal").classList.add("hidden");});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeProductDetails();$("#imageZoomModal")?.classList.add("hidden");}});
$("#searchInput").addEventListener("input",renderProducts);
$("#categoryFilter").addEventListener("change",()=>{activeCategory=$("#categoryFilter").value;renderCategories();renderProducts();});
$("#sortFilter").addEventListener("change",renderProducts);
$("#cartOpen").addEventListener("click",()=>{renderCart();openModal("cartDrawer");});
$("#checkoutOpen").addEventListener("click",()=>{if(!cart.length){toast("Your cart is empty.");return;}closeModal("cartDrawer");openModal("checkoutModal");});
$("#cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]");const rem=e.target.closest("[data-remove]");
  if(qty){const item=cart.find(x=>x.id===qty.dataset.qty);if(item){item.qty+=Number(qty.dataset.delta);if(item.qty<=0)cart=cart.filter(x=>x.id!==qty.dataset.qty);}save();renderCart();}
  if(rem){cart=cart.filter(x=>x.id!==rem.dataset.remove);save();renderCart();}
});
$("#checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();if(!cart.length){toast("Your cart is empty.");return;}
  const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  const lines=cart.map(item=>{const p=products.find(x=>x.id===item.id);return `• ${p?p.name:"Product"} × ${item.qty} — ${money((p?.price||0)*item.qty)}`;});
  const total=cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id);return sum+(Number(p?.price)||0)*item.qty;},0);
  const msg=`ARKS ONE ORDER REQUEST\n\nCustomer: ${data.name}\nPhone: ${data.phone}\nAddress: ${data.address}\nPayment preference: ${data.payment}\n\nItems:\n${lines.join("\n")}\n\nEstimated total: ${money(total)}\nNotes: ${data.notes||"None"}\n\nPlease confirm stock, delivery charge and final total.`;
  sendWhatsApp(msg);closeModal("checkoutModal");
});
let pendingProductPhoto = "";
function resizeProductPhoto(file){
  return new Promise((resolve,reject)=>{
    if(!file){resolve("");return;}
    if(!file.type.startsWith("image/")){reject(new Error("Please choose an image file."));return;}
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Could not read this photo."));
    reader.onload=()=>{
      const image=new Image();
      image.onerror=()=>reject(new Error("Could not open this photo."));
      image.onload=()=>{
        const max=1000, scale=Math.min(1,max/Math.max(image.width,image.height));
        const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
        const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.78));
      };
      image.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
$("#adminOpen").addEventListener("click",()=>openModal("adminModal"));
$("#adminProductPhoto")?.addEventListener("change",async e=>{
  const file=e.target.files?.[0],preview=$("#adminPhotoPreview");pendingProductPhoto="";
  if(!file){preview.classList.add("hidden");preview.removeAttribute("src");return;}
  try{pendingProductPhoto=await resizeProductPhoto(file);preview.src=pendingProductPhoto;preview.classList.remove("hidden");}
  catch(err){toast(err.message||"Could not process photo.");e.target.value="";preview.classList.add("hidden");}
});
$("#adminForm").addEventListener("submit",e=>{
  e.preventDefault();const form=e.currentTarget,d=Object.fromEntries(new FormData(form).entries());
  const product={id:"p"+Date.now(),name:d.name.trim(),category:d.category,price:Number(d.price),emoji:d.emoji||"📦",description:d.description||"",image_url:pendingProductPhoto, sizes:(d.sizes||"").split(/[,|;]/).map(x=>x.trim()).filter(Boolean), colors:(d.colors||"").split(/[,|;]/).map(x=>x.trim()).filter(Boolean), stock_quantity:d.stock_quantity===""?null:Number(d.stock_quantity),tag:"NEW"};
  products.unshift(product);
  try{save();renderProducts();form.reset();pendingProductPhoto="";$("#adminPhotoPreview")?.classList.add("hidden");closeModal("adminModal");toast("Product added in this browser only. It is not published to the live store.");}
  catch(err){products=products.filter(p=>p.id!==product.id);toast("Could not save. Try a smaller photo or remove older demo products.");}
});
$("#exportProducts").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(products,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="arks-one-products.json";a.click();URL.revokeObjectURL(url);
});
$("#resetProducts").addEventListener("click",()=>{if(confirm("Reset the demo products to the original sample list?")){products=starterProducts.map(p=>({...p}));cart=[];save();renderProducts();renderCart();toast("Demo products reset.");}});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
document.querySelectorAll(".modal-backdrop,.drawer-backdrop").forEach(el=>el.addEventListener("click",e=>{if(e.target===el)closeModal(el.id);}));
$("#serviceWhatsApp").addEventListener("click",e=>{if(STORE.whatsappNumber.includes("REPLACE")){e.preventDefault();toast("Set your WhatsApp number in app.js first.");}else e.currentTarget.href=`https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent("Hello ARKS ONE, I would like to enquire about your services.")}`;});
$("#footerContact").addEventListener("click",()=>sendWhatsApp("Hello ARKS ONE, I have a question."));
$("#year").textContent=new Date().getFullYear();
renderCategories();renderProducts();renderCart();


/* Multi-slide homepage promotions: auto-rotate, arrows, dots, and touch swipe. */
(() => {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll("[data-go-slide]"));
  const prev = slider.querySelector(".hero-prev");
  const next = slider.querySelector(".hero-next");
  let current = 0;
  let timer;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
      dot.setAttribute("aria-current", i === current ? "true" : "false");
    });
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), 5000); };
  prev?.addEventListener("click", () => { show(current - 1); start(); });
  next?.addEventListener("click", () => { show(current + 1); start(); });
  dots.forEach(dot => dot.addEventListener("click", () => { show(Number(dot.dataset.goSlide)); start(); }));
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", start);
  let touchStart = null;
  slider.addEventListener("touchstart", e => { touchStart = e.changedTouches[0].clientX; }, {passive:true});
  slider.addEventListener("touchend", e => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    touchStart = null;
    start();
  }, {passive:true});
  show(0);
  start();
})();


/* Compatible local promotional video player for MP4/WebM files. */
(() => {
  const modal = document.querySelector("#videoModal");
  const player = document.querySelector("#promoVideoPlayer");
  const message = document.querySelector("#videoPlayerMessage");
  if (!modal || !player) return;
  document.querySelectorAll("[data-video-play]").forEach(button => {
    button.addEventListener("click", () => {
      const src = button.dataset.videoPlay;
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      player.pause();
      player.removeAttribute("src");
      player.load();
      player.src = src;
      player.poster = button.dataset.videoPoster || "";
      message.textContent = `Loading ${src}… If it does not play, upload this video file to the website root. Supported formats: MP4 (H.264/AAC) and WebM.`;
      player.onerror = () => {
        message.textContent = `Video file "${src}" is not uploaded yet or could not be played. Upload a compatible MP4/WebM file to the website root, then try again.`;
      };
      player.onloadedmetadata = () => { message.textContent = ""; };
      player.play().catch(() => {});
    });
  });
  const close = () => {
    player.pause();
    player.removeAttribute("src");
    player.load();
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };
  modal.querySelector("[data-video-close]")?.addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.classList.contains("hidden")) close(); });
})();
