/* ----------------- UPDATE PLACE ORDER BUTTON ----------------- */
function updatePlaceOrderButton() {
  let itemCount = 0;
  let totalPrice = 0;

  const products = document.querySelectorAll('.product'); // add this
  products.forEach(product => {
    product.querySelectorAll('.size-row').forEach(row => {
      const qtyInput = row.querySelector('.qty');
      const qty = parseInt(qtyInput.value) || 0;
      const price = parseInt(row.dataset.price) || 0;

      if (qty > 0) {
        itemCount += qty;
        totalPrice += qty * price;
      }
    });
  });

  document.getElementById('itemCount').innerText = itemCount;
  document.getElementById('totalPrice').innerText = totalPrice;
}

/* ----------------- GO TO CONFIRM PAGE ----------------- */
function goToConfirm() {
  const products = document.querySelectorAll('.product');
  let cart = [];
  let total = 0;

  products.forEach(product => {
    const productName = product.dataset.name || "Unknown Product";

    product.querySelectorAll('.size-row').forEach(row => {
      const qty = parseInt(row.querySelector('.qty').value) || 0; // use value, not innerText
      const size = row.dataset.size || row.querySelector('.size-price-line').innerText.split(' – ')[0];
      const price = parseInt(row.dataset.price) || 0;

      if (qty > 0) {
        cart.push({
          name: productName,
          size: size,
          qty: qty,
          price: price
        });
        total += qty * price;
      }
    });
  });

  if (cart.length === 0) {
    alert('Please add at least 1 product to proceed!');
    return;
  }

  localStorage.setItem('cart', JSON.stringify({ cart, total }));
  window.location.href = 'confirm.html';
}

/* ----------------- CONFIRM PAGE ----------------- */
if (document.getElementById('orderSummary')) {
  const data = JSON.parse(localStorage.getItem('cart'));
  let html = `
    <table style="width:100%; border-collapse: collapse; text-align:left; font-size:14px;">
      <thead>
        <tr style="background-color:#007bff; color:#fff;">
          <th style="padding:8px; border:1px solid #ccc;">Product</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:center;">Size</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:right;">Unit Price</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:center;">Qty</th>
          <th style="padding:8px; border:1px solid #ccc; text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.cart.forEach(item => {
    html += `
      <tr>
        <td style="padding:8px; border:1px solid #ccc;">${item.name}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:center;">${item.size}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:right;">₹${item.price}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:center;">${item.qty}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:right;">₹${item.qty * item.price}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  document.getElementById('orderSummary').innerHTML = html;
  document.getElementById('totalAmount').innerText = data.total;
}

function confirmOrder() {
  const name = document.getElementById('name').value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }

  const data = JSON.parse(localStorage.getItem('cart'));
  if (!data || !data.cart || data.cart.length === 0) {
    alert('No order data found');
    return;
  }

  /* ---------- SHOW THANK YOU MESSAGE ---------- */
  document.getElementById('thankYouMessage').style.display = 'block';
  document.getElementById('thankYouMessage').scrollIntoView({ behavior: 'smooth' });

  /* ---------- DISABLE CONFIRM BUTTON ---------- */
  document.getElementById('confirmButton').style.pointerEvents = 'none';
  document.getElementById('confirmButton').style.opacity = '0.6';

  /* ---------- EMAILJS SEND ---------- */
  sendOrderEmail(name, data);
}

function sendOrderEmail(customerName, data) {
  if (!data || !data.cart || data.cart.length === 0) {
    console.error("No order data to send");
    return;
  }

  let orderRows = '';

  data.cart.forEach(item => {
    orderRows += `
      <tr>
        <td style="padding:8px; border:1px solid #ccc;">${item.name}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:center;">${item.size}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:right;">₹${item.price}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:center;">${item.qty}</td>
        <td style="padding:8px; border:1px solid #ccc; text-align:right;">₹${item.qty * item.price}</td>
      </tr>
    `;
  });

  emailjs.send(
    "service_geen62e",
    "template_kpcp409",
    {
      customer_name: customerName || "Unknown Customer",
      order_date: new Date().toLocaleString(),
      order_details: orderRows || "<tr><td colspan='5'>No items</td></tr>", // <-- changed 4 → 5
      total_amount: Number(data.total) || 0
    },
    "wNOqr7rn5AIrp86Xi"
  ).then(
    () => console.log("Email sent successfully"),
    err => console.error("Email send failed", err)
  );
}



/* ----------------- QTY & PRODUCT HIGHLIGHT ----------------- */
document.querySelectorAll('.qty').forEach(input => {
  input.addEventListener('focus', () => {
    // remove previous highlights
    document.querySelectorAll('.qty').forEach(q => q.classList.remove('active-qty'));
    document.querySelectorAll('.product').forEach(p => p.classList.remove('active-product'));

    // add highlight
    input.classList.add('active-qty');
    input.closest('.product').classList.add('active-product');
  });
});

/* Clear highlight only after Place Order */
const placeBtn = document.getElementById('placeOrderBtn');
if (placeBtn) {
  placeBtn.addEventListener('click', () => {
    document.querySelectorAll('.qty').forEach(q => q.classList.remove('active-qty'));
    document.querySelectorAll('.product').forEach(p => p.classList.remove('active-product'));
  });
}

/* ----------------- HIGHLIGHT WHEN QTY >= 1 ----------------- */
document.querySelectorAll('.qty').forEach(input => {
  input.addEventListener('input', () => {
    const row = input.closest('.size-row');
    const product = input.closest('.product');
    const qty = parseInt(input.value) || 0;

    if (qty >= 1) {
      input.classList.add('active-qty');
      row.classList.add('active-row');
      product.classList.add('active-product');
    } else {
      input.classList.remove('active-qty');
      row.classList.remove('active-row');

      // remove product highlight ONLY if no other size-row has qty >= 1
      const hasAnyQty = [...product.querySelectorAll('.qty')]
        .some(q => parseInt(q.value) >= 1);

      if (!hasAnyQty) {
        product.classList.remove('active-product');
      }
    }
  });
});

/* Clear all highlights ONLY on Place Order */
const placeOrderBtn = document.getElementById('placeOrderBtn');
if (placeOrderBtn) {
  placeOrderBtn.addEventListener('click', () => {
    document.querySelectorAll('.qty').forEach(q => q.classList.remove('active-qty'));
    document.querySelectorAll('.size-row').forEach(r => r.classList.remove('active-row'));
    document.querySelectorAll('.product').forEach(p => p.classList.remove('active-product'));
  });
}

/* ----------------- INVOICE PDF DOWNLOAD ----------------- */
const downloadBtn = document.getElementById('downloadInvoiceBtn');

if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    generateInvoicePDF();
  });
}

function generateInvoicePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---------------- HEADER ----------------
  doc.setFillColor(0, 123, 255); // Blue header
  doc.rect(0, 0, pageWidth, 25, 'F');

  // Add Logo
  doc.addImage('images/logo.png', 'PNG', 10, 3, 20, 20);

  // Add Company Name
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Sun Marketing Madurai", 35, 16);

  // Reset text color for table/content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  const data = JSON.parse(localStorage.getItem('cart'));
  const customerName = document.getElementById('name').value.trim();
  let startY = 35; // table starts below header
  const rowHeight = 8;

  // ---------------- CUSTOMER INFO ----------------
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Customer: ${customerName}`, 10, 30);
  doc.text(`Date: ${new Date().toLocaleString()}`, 130, 30);

  // ---------------- TABLE HEADER ----------------
  doc.setFillColor(0, 123, 255); // Blue header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.rect(10, startY, pageWidth - 20, rowHeight, 'F');
  doc.text("Product", 12, startY + 6);
  doc.text("Size", 80, startY + 6, { align: 'center' });
  doc.text("Qty", 110, startY + 6, { align: 'center' });
  doc.text("Unit Price", 135, startY + 6, { align: 'right' });
  doc.text("Total", 165, startY + 6, { align: 'right' });

  startY += rowHeight;

  // ---------------- TABLE ROWS ----------------
  data.cart.forEach((item, index) => {
    // Alternating row color
    if (index % 2 === 0) doc.setFillColor(240, 240, 240); // light gray
    else doc.setFillColor(255, 255, 255); // white
    doc.rect(10, startY, pageWidth - 20, rowHeight, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    doc.text(item.name, 12, startY + 6);
    doc.text(item.size, 80, startY + 6, { align: 'center' });
    doc.text(item.qty.toString(), 110, startY + 6, { align: 'center' });
    doc.text(`Rs. ${item.price}`, 135, startY + 6, { align: 'right' });
    doc.text(`Rs. ${item.qty * item.price}`, 165, startY + 6, { align: 'right' });

    startY += rowHeight;
  });

  // ---------------- TOTAL ----------------
  startY += 5;
  doc.setDrawColor(0);
  doc.line(10, startY, pageWidth - 10, startY); // horizontal line
  startY += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: Rs. ${data.total}`, 165, startY, { align: 'right' });

  // ---------------- THANK YOU NOTE ----------------
  startY += 10; // space below total
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Thanks for ordering!", 12, startY);
  startY += 6;
  doc.text("Your order has been forwarded to Sun Marketing Madurai.", 12, startY);

  // ---------------- SAVE ----------------
  doc.save(`Invoice_${Date.now()}.pdf`);

  // Clear cart AFTER download
  localStorage.clear();
}

