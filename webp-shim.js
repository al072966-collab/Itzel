// Itzel · dist: el código pide .png y aquí se sirve el .webp (todas las imágenes del paquete están convertidas).
(function () {
  const aWebp = u => (typeof u === 'string' && /\.png(\?|#|$)/i.test(u) && !/^data:|^blob:/.test(u)) ? u.replace(/\.png(\?|#|$)/i, '.webp$1') : u;
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (d && d.set) Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, aWebp(v)); } });
  const sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (k, v) { return sa.call(this, k, (k === 'src' && this instanceof HTMLImageElement) ? aWebp(v) : v); };
  const f = window.fetch; if (f) window.fetch = function (u, o) { return f.call(this, typeof u === 'string' ? aWebp(u) : u, o); };
  window.__aWebp = aWebp;
})();
