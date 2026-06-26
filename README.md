# Lumière Estética Avançada — Site Institucional

Site institucional single-page premium para clínica de estética. **HTML + CSS + JS puros**, sem frameworks ou bibliotecas (apenas Google Fonts e Font Awesome via CDN).

---

## 📁 Estrutura

```
lumiere-estetica/
├── index.html
└── assets/
    ├── css/style.css
    ├── js/script.js
    └── img/   (vazio — usa placeholders do Unsplash)
```

Basta abrir `index.html` no navegador. Para produção, sirva por um servidor estático (Vercel, Netlify, GitHub Pages, Apache, Nginx, etc.).

---

## 🖼️ Substituindo as imagens placeholder

Todas as imagens hoje são URLs do Unsplash (queries: spa, facial, aesthetic clinic, skin care). Para colocar fotos reais:

1. **Salve as fotos** em `assets/img/` (ex.: `hero.jpg`, `sobre-1.jpg`, `servico-limpeza.jpg`, etc.).
2. **Substitua os `src`** no `index.html` procurando pelos comentários `<!-- PLACEHOLDER -->` (existem 14 ao todo).
3. **Otimize** antes de subir: WebP/AVIF com fallback JPG, resolução máxima de 1600px no maior lado, compressão a 80%.
4. **Mantenha as proporções** indicadas no CSS (hero: 4/5, cards: 4/3, galeria: 16/9 ou 1/1).
5. **Sempre preencha `alt`** descritivo (acessibilidade + SEO).

Imagens necessárias (mínimo recomendado):
- 1 imagem hero (mulher em tratamento, alta resolução)
- 2 imagens da clínica (interior + detalhe ou fachada)
- 6 imagens de tratamentos (1 para cada serviço)
- 6 imagens antes/depois (com autorização escrita das clientes)
- 5 avatares de depoimentos
- 1 imagem da fachada externa

---

## 📨 Conectando o formulário a um backend real

A submissão hoje é simulada. Três opções fáceis para colocar em produção:

### Opção 1 — Formspree (mais simples, sem backend)
1. Crie conta em [formspree.io](https://formspree.io) e copie seu endpoint.
2. No `index.html`, mude:
   ```html
   <form class="form" id="contatoForm" novalidate
         action="https://formspree.io/f/SEU_ID" method="POST">
   ```
3. No `script.js`, dentro de `setTimeout(() => { ... }, 1200)`, substitua a simulação por:
   ```js
   fetch(form.action, {
     method: 'POST',
     headers: { 'Accept': 'application/json' },
     body: new FormData(form)
   }).then(() => { toast.classList.add('show'); form.reset(); });
   ```

### Opção 2 — EmailJS (envia direto pelo navegador, sem backend)
1. Cadastre-se em [emailjs.com](https://www.emailjs.com), configure serviço e template.
2. Inclua o SDK no `<head>`: `<script src="https://cdn.emailjs.com/dist/email.min.js"></script>`
3. No `script.js`, troque a simulação por `emailjs.sendForm('service_id', 'template_id', form)`.

### Opção 3 — WhatsApp Business API (lead direto na conversa)
Para apenas direcionar a conversa para WhatsApp:
```js
const msg = `Olá! Meu nome é ${nome.value}. Tenho interesse em ${$('#fTratamento').value || 'avaliação'}.`;
window.open(`https://wa.me/5511999998888?text=${encodeURIComponent(msg)}`, '_blank');
```

---

## 📊 Adicionando Google Analytics 4 e Pixel do Facebook

No `<head>` do `index.html`, antes do `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'SEU_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

Para rastrear conversão no submit do form, adicione no `script.js` ao mostrar o toast:
```js
gtag('event', 'lead', { event_category: 'formulario', event_label: 'avaliacao_gratuita' });
fbq('track', 'Lead');
```

---

## 🚀 Sugestões de melhorias futuras

- **Blog** (SEO + autoridade): seção `/blog` com Eleventy ou Astro mantendo o mesmo design.
- **Área da cliente**: histórico de tratamentos, fotos de evolução, próximas sessões.
- **Agendamento online integrado**: Calendly, SimplyBook ou solução custom com Supabase.
- **Chatbot no WhatsApp**: pré-qualifica leads antes de chegarem ao formulário.
- **Programa de indicação**: cupom para quem indica, integrado ao CRM.
- **Schema.org**: marcação `LocalBusiness` + `MedicalBusiness` para melhor SEO local.
- **Versão multilíngue**: PT/EN para atender turismo médico.
- **Dark mode**: alternativa elegante para visitantes noturnos (toggle no header).

---

## ✅ Checklist de qualidade atendido

- ✅ HTML5 semântico
- ✅ Meta tags completas (charset, viewport, description, OG, favicon)
- ✅ Acessibilidade WCAG AA (aria-labels, alt text, contraste, foco visível, prefers-reduced-motion)
- ✅ CSS organizado por seções com comentários
- ✅ Custom Properties para tema
- ✅ Mobile-first com breakpoints 640/768/1024px
- ✅ JavaScript modular sem libs
- ✅ Zero erros de console
- ✅ Performance: lazy loading, fontes com `display=swap`, preconnect

---

Desenvolvido com 💛 para a Lumière.
