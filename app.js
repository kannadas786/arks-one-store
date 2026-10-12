/* ARKS ONE starter store.
   Demo mode: cart/products use this browser's localStorage; orders are sent as a WhatsApp message.
   Before real launch, connect a shared database, secure authentication, stock checks and payment provider. */
const STORE = {
  // Public browser settings. Publishable keys are intended for public clients; never put a secret/service_role key here.
  supabaseUrl: "https://amiajikrgtebxvvlnwyo.supabase.co",
  supabasePublishableKey: "sb_publishable_vx_SdvP0FR3cnXG0K_R4uQ_TFFpwOE5",
  // Replace with your WhatsApp number including country code, digits only. Example India: 919876543210
  whatsappNumber: "REPLACE_WITH_YOUR_WHATSAPP_NUMBER",
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
let databaseConnected = false;
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
function renderProducts(){
  let list=[...products];const q=$("#searchInput").value.trim().toLowerCase();const cat=$("#categoryFilter").value;
  if(cat!=="All")list=list.filter(p=>p.category===cat);if(q)list=list.filter(p=>(p.name+" "+p.description+" "+p.category).toLowerCase().includes(q));
  const sort=$("#sortFilter").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
  $("#productSummary").textContent=`${list.length} item${list.length===1?"":"s"}`;
  $("#productGrid").innerHTML=list.map(p=>`<article class="product-card"><div class="product-visual"><span class="product-tag">${safe(p.tag||p.category)}</span>${p.image_url?`<img class="product-image" src="${safe(p.image_url)}" alt="${safe(p.name)}" loading="lazy" onerror="this.style.display='none'">`:`<span class="emoji">${safe(p.emoji||"📦")}</span>`}</div><div class="product-info"><span class="product-category">${safe(p.category)}</span><h3>${safe(p.name)}</h3><div class="product-description">${safe(p.description||"")}</div><div class="product-bottom"><span class="price">${Number(p.price)===0?"Ask for quote":money(p.price)}</span><button class="add-button" data-add="${safe(p.id)}">${Number(p.price)===0?"Enquire":"Add +"}</button></div></div></article>`).join("");
  $("#emptyState").classList.toggle("hidden",list.length!==0);
}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((sum,i)=>sum+i.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map(item=>{const p=products.find(x=>x.id===item.id)||item.product;return `<div class="cart-item"><div class="cart-item-emoji">${safe(p.emoji||"📦")}</div><div><h4>${safe(p.name)}</h4><p>${money(p.price)}</p><div class="qty-controls"><button data-qty="${safe(p.id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${safe(p.id)}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-button" data-remove="${safe(p.id)}">Remove</button></div>`}).join(""):'<div class="empty-state">Your cart is empty.<br>Add a product to get started.</div>';
  $("#cartTotal").textContent=money(cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id)||item.product;return sum+(Number(p.price)||0)*item.qty;},0));
}
function openModal(id){$("#"+id).classList.remove("hidden");document.body.style.overflow="hidden";}
function closeModal(id){$("#"+id).classList.add("hidden");if(!document.querySelector(".modal-backdrop:not(.hidden),.drawer-backdrop:not(.hidden)"))document.body.style.overflow="";}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;if(Number(p.price)===0){sendWhatsApp(`Hello ARKS ONE, I would like to enquire about: ${p.name}`);return;}const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});save();renderCart();toast("Added to your cart.");}
function sendWhatsApp(message){
  if(!STORE.whatsappNumber||STORE.whatsappNumber.includes("REPLACE")){toast("Set your WhatsApp number in app.js before using order links.");return;}
  const url=`https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;window.open(url,"_blank","noopener");
}
$("#categoryList").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;$("#categoryFilter").value=activeCategory;renderCategories();renderProducts();$("#shop").scrollIntoView({behavior:"smooth"});});
$("#productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(b.dataset.add);});
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
$("#adminOpen").addEventListener("click",()=>openModal("adminModal"));
$("#adminForm").addEventListener("submit",e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  products.unshift({id:"p"+Date.now(),name:d.name.trim(),category:d.category,price:Number(d.price),emoji:d.emoji||"📦",description:d.description||"",tag:"NEW"});
  save();renderProducts();e.currentTarget.reset();toast("Product added to this browser only.");
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
async function loadSupabaseProducts(){
  if(!STORE.supabaseUrl || !STORE.supabasePublishableKey) return;
  try {
    const response = await fetch(`${STORE.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=created_at.desc`, {
      headers: { apikey: STORE.supabasePublishableKey, Authorization: `Bearer ${STORE.supabasePublishableKey}` }
    });
    if(!response.ok) throw new Error(`Supabase returned ${response.status}`);
    const rows = await response.json();
    products = rows.map(row => ({
      id: String(row.id), name: row.name || "Unnamed product", description: row.description || "",
      category: categories.some(c=>c.name===row.category) ? row.category : (row.category || "More"),
      price: Number(row.price || 0), original_price: row.original_price == null ? null : Number(row.original_price),
      image_url: row.image_url || "", stock_quantity: Number(row.stock_quantity || 0),
      emoji: "📦", tag: row.product_type || "ARKS ONE"
    }));
    databaseConnected = true;
    renderCategories(); renderProducts(); renderCart();
    const status = document.querySelector("#databaseStatus"); if(status) status.textContent = `Live catalogue connected · ${products.length} product(s)`;
    if(!products.length) toast("Supabase is connected, but there are no active products yet.");
  } catch(error) {
    console.error("Supabase product load failed:", error);
    const status = document.querySelector("#databaseStatus"); if(status) status.textContent = "Showing demo products · database connection needs checking";
  }
}
renderCategories();renderProducts();renderCart();
loadSupabaseProducts();
