/********** SUKOON — Product detail behaviour (vanilla JS) **********
 * Reads ?essence=, resolves it through the unified product catalog in
 * data/products.js and renders:
 *   1. Hero: gallery + info (title, tagline, price, lead, why-choose, rating)
 *   2. Description: title + paragraphs + key facts (pillars)
 *   3. Brewing: ritual steps + badges  OR  method columns
 *   4. Ingredients & origin: (optional) nutrition + certifications
 *   5. Customer reviews: (optional) summary bars + entries
 *   6. Discover other essences: carousel (current product excluded)
 *
 * All copy lives as i18n keys in /i18n/*.js and is resolved via SKI18N.t.
 * The schema in data/products.js uses labelKey/valueKey consistently —
 * the renderer only ever calls resolve({key}) / t(key).
 */
(function (global) {
    "use strict";

    var PRODUCTS = global.SK_PRODUCTS;
    if (!PRODUCTS) return;

    var SUPPORTED = ['royal-verbena', 'moroccan-mint', 'noble-chamomile', 'atlas-oregano', 'ruby-hibiscus', 'heritage-fennel'];

    /* ----------------------------------------------------------------
       Helpers
       ---------------------------------------------------------------- */
    function readEssence() {
        var params = new URLSearchParams(global.location.search);
        var raw = params.get('essence') || params.get('slug');
        if (raw && SUPPORTED.indexOf(raw) !== -1) return raw;
        return 'ruby-hibiscus';
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function t(key, vars) {
        if (!key) return '';
        return global.SKI18N ? global.SKI18N.t(key, vars) : (vars ? key : key);
    }

    function resolveKey(key) {
        return key ? t(key) : '';
    }

    /* Resolve a field object: { key } → t(key), { text } → verbatim */
    function resolveField(field) {
        if (!field) return '';
        if (field.key) return t(field.key);
        if (field.text) return field.text;
        if (field.html) return field.html;
        return '';
    }

    function starString(n) {
        if (n >= 5) return t('reviews.stars.5');
        if (n === 4) return t('reviews.stars.4');
        if (n === 3) return t('reviews.stars.3');
        if (n === 2) return t('reviews.stars.2');
        if (n <= 1) return t('reviews.stars.1');
        return t('reviews.stars.5');
    }

    function escHtml(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ----------------------------------------------------------------
       Gallery
       ---------------------------------------------------------------- */
    function buildImageList(slug) {
        var def = PRODUCTS.gallery[slug] || { photos: [PRODUCTS.byId(slug).image], packshots: [PRODUCTS.byId(slug).image] };
        var list = [];
        (def.photos || []).forEach(function (src) { list.push({ src: src, kind: 'photo' }); });
        (def.packshots || []).forEach(function (src) { list.push({ src: src, kind: 'packshot' }); });
        return list;
    }

    function dimsFor(src) {
        return PRODUCTS.dims && PRODUCTS.dims[src] ? PRODUCTS.dims[src] : null;
    }

    function renderGallery(slug) {
        var main = document.getElementById('skPdMainImg');
        var thumbs = document.getElementById('skPdThumbs');
        var prod = PRODUCTS.byId(slug);
        if (!main || !thumbs || !prod) return;

        var images = buildImageList(slug);
        var first = images.length ? images[0] : { src: prod.image, kind: 'packshot' };

        main.src = first.src;
        main.alt = t(prod.altKey || ('product.' + slug + '.alt'), prod.nameKey);
        main.className = first.kind === 'photo' ? 'sk-es-img' : 'sk-es-other-img';
        main.setAttribute('loading', 'eager');
        main.setAttribute('decoding', 'async');
        var d = dimsFor(first.src);
        if (d) { main.setAttribute('width', d[0]); main.setAttribute('height', d[1]); }

        thumbs.innerHTML = '';
        images.forEach(function (img, i) {
            var figure = document.createElement('figure');
            figure.className = 'sk-pd-thumb' + (i === 0 ? ' is-active' : '') + (img.kind === 'photo' ? ' sk-pd-thumb--photo' : '');
            figure.setAttribute('data-sk-pd-img', img.src);
            figure.setAttribute('data-sk-pd-alt', t(prod.altKey || ('product.' + slug + '.alt'), prod.nameKey));
            figure.setAttribute('aria-label', t(prod.nameKey) + ' \u2014 ' + (i + 1));
            figure.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
            figure.setAttribute('tabindex', '0');
            figure.setAttribute('role', 'button');
            var thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = '';
            thumbImg.className = img.kind === 'photo' ? 'sk-es-img' : 'sk-es-other-img';
            thumbImg.setAttribute('loading', 'lazy');
            thumbImg.setAttribute('decoding', 'async');
            thumbImg.setAttribute('width', '72');
            thumbImg.setAttribute('height', '72');
            figure.appendChild(thumbImg);
            thumbs.appendChild(figure);
        });
    }

    function initGallerySwap() {
        var thumbs = document.getElementById('skPdThumbs');
        var main = document.getElementById('skPdMainImg');
        if (!thumbs || !main) return;
        thumbs.addEventListener('click', function (e) {
            var fig = (e.target.closest || function () { return null; }).call(e.target, '.sk-pd-thumb');
            if (!fig) return;
            var src = fig.getAttribute('data-sk-pd-img');
            if (!src) return;
            main.src = src;
            main.alt = fig.getAttribute('data-sk-pd-alt') || '';
            main.className = fig.classList.contains('sk-pd-thumb--photo') ? 'sk-es-img' : 'sk-es-other-img';
            var d = dimsFor(src);
            if (d) { main.setAttribute('width', d[0]); main.setAttribute('height', d[1]); }
            thumbs.querySelectorAll('.sk-pd-thumb').forEach(function (t) {
                var on = t === fig;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        });
    }

    /* ----------------------------------------------------------------
       Hero
       ---------------------------------------------------------------- */
    function renderHero(slug, prod, detail) {
        var eyebrowText = document.querySelector('#skPdEyebrow .sk-es-eyebrow-text');
        if (eyebrowText && detail) {
            eyebrowText.setAttribute('data-i18n', detail.eyebrowKey || 'essence.eyebrow');
            eyebrowText.textContent = t(detail.eyebrowKey || 'essence.eyebrow');
        }

        var title = document.getElementById('skPdTitle');
        if (title) {
            title.setAttribute('data-i18n', prod.nameKey);
            title.textContent = t(prod.nameKey);
        }

        var tagline = document.getElementById('skPdTagline');
        if (tagline) {
            tagline.setAttribute('data-i18n', prod.taglineKey);
            tagline.textContent = t(prod.taglineKey);
            tagline.hidden = false;
        }

        /* Rating — computed from actual review data */
        var rating = document.getElementById('skPdRating');
        if (rating) {
            var r = detail.rating || (detail.reviews ? { stars: detail.reviews.stars, count: detail.reviews.count } : null);
            if (r && r.stars) {
                rating.hidden = false;
                rating.querySelector('.sk-pd-stars').textContent = starString(r.stars);
                rating.querySelector('.sk-pd-stars').setAttribute('aria-label', r.stars + ' out of 5 stars');
                rating.querySelector('.sk-pd-rating-count').textContent = '(' + r.count + ' ' + t('reviews.count') + ')';
            } else {
                rating.hidden = true;
            }
        }

        /* Lead paragraph */
        var lead = document.getElementById('skPdLead');
        if (lead) {
            if (detail.leadKey) {
                lead.textContent = t(detail.leadKey);
                lead.hidden = false;
            } else {
                lead.hidden = true;
            }
        }

        /* Price */
        var price = document.getElementById('skPdPrice');
        if (price) {
            var priceData = prod.price;
            if (priceData) {
                price.hidden = false;
                price.querySelector('.sk-pd-price-amount').textContent = '$' + priceData.toFixed(2);
                price.querySelector('.sk-pd-price-del').style.display = 'none';
            } else {
                price.hidden = true;
            }
        }

        /* Cart button product attribute */
        var cartBtn = document.getElementById('skPdCartBtn');
        if (cartBtn) cartBtn.setAttribute('data-product', slug);

        /* Why-choose — show real value, remove rows with no data */
        var whyWrap = document.getElementById('skPdWhyWrap');
        if (whyWrap) {
            if (detail.why && detail.why.length) {
                whyWrap.hidden = false;
                var whyList = document.getElementById('skPdWhy');
                whyList.innerHTML = '';
                detail.why.forEach(function (item) {
                    var label = t(item.labelKey);
                    var value = t(item.valueKey);
                    /* Skip rows where label or value is missing/empty */
                    if (!label || !value) return;
                    var li = document.createElement('li');
                    li.className = 'sk-pd-why-item';
                    li.innerHTML = '<span class="sk-pd-why-icon" aria-hidden="true">' + PRODUCTS.icon(item.icon) + '</span>' +
                        '<span class="sk-pd-why-body">' +
                        '<span class="sk-pd-why-label">' + esc(label) + '</span>' +
                        '<span class="sk-pd-why-value">' + esc(value) + '</span>' +
                        '</span>';
                    whyList.appendChild(li);
                });
                /* Hide why-wrap if all rows were filtered out */
                if (!whyList.children.length) whyWrap.hidden = true;
            } else {
                whyWrap.hidden = true;
            }
        }
    }

    /* ----------------------------------------------------------------
       Description (title + paragraphs + facts/pillars)
       ---------------------------------------------------------------- */
    function renderDescription(prod, detail) {
        var section = document.getElementById('pdDescription');
        if (!section) return;
        var desc = detail.description;
        if (!desc) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var head = section.querySelector('.sk-pd-head');
        if (head) {
            var eyebrow = head.querySelector('.sk-es-eyebrow-text');
            if (eyebrow) {
                eyebrow.setAttribute('data-i18n', detail.eyebrowKey || 'essence.eyebrow');
                eyebrow.textContent = t(detail.eyebrowKey || 'essence.eyebrow');
            }
            var title = head.querySelector('.sk-es-title');
            if (title) {
                title.setAttribute('data-i18n', desc.titleKey);
                title.textContent = t(desc.titleKey);
            }
        }

        var copy = section.querySelector('.sk-pd-desc-copy');
        if (copy) {
            copy.innerHTML = '';
            if (desc.paraKeys && desc.paraKeys.length) {
                desc.paraKeys.forEach(function (key) {
                    var el = document.createElement('p');
                    el.className = 'sk-es-lead';
                    el.textContent = t(key);
                    copy.appendChild(el);
                });
            }
        }

        /* Facts (pillars) — fixed rendering uses labelKey/valueKey consistently */
        var facts = section.querySelector('.sk-pd-facts');
        if (facts) {
            facts.innerHTML = '';
            if (desc.factKeys && desc.factKeys.length) {
                desc.factKeys.forEach(function (f) {
                    var li = document.createElement('li');
                    li.className = 'sk-pd-fact';
                    var label = f.labelKey ? t(f.labelKey) : '';
                    var value = f.valueKey ? t(f.valueKey) : '';
                    li.innerHTML = '<span class="sk-pd-fact-icon" aria-hidden="true">' + PRODUCTS.icon(f.icon) + '</span>' +
                        '<span class="sk-pd-fact-body">' +
                        '<span class="sk-pd-fact-label">' + esc(label) + '</span>' +
                        '<span class="sk-pd-fact-value">' + esc(value) + '</span>' +
                        '</span>';
                    facts.appendChild(li);
                });
            }
        }
    }

    /* ----------------------------------------------------------------
       Brewing
       ---------------------------------------------------------------- */
    function renderBrewing(prod, detail) {
        var section = document.getElementById('pdBrewing');
        if (!section) return;
        if (!detail.brewing) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var body = section.querySelector('.sk-pd-brew-body');
        if (body) body.innerHTML = '';

        var head = section.querySelector('.sk-pd-head');
        if (head) {
            var eyebrow = head.querySelector('.sk-es-eyebrow-text');
            if (eyebrow) {
                eyebrow.setAttribute('data-i18n', detail.brewing.eyebrowKey);
                eyebrow.textContent = t(detail.brewing.eyebrowKey);
            }
        }

        /** FIX: use one product name per product everywhere, including ritual heading **/
        var titleEl = section.querySelector('.sk-pd-head .sk-es-title');
        var ritualTitle = t(detail.brewing.titleKey);
        /* Ensure the product name appears (not a stale cached name from another product) */
        titleEl.setAttribute('data-i18n', detail.brewing.titleKey);
        titleEl.textContent = ritualTitle;

        var leadEl = section.querySelector('.sk-pd-head .sk-es-lead');
        if (detail.brewing.leadKey) {
            leadEl.textContent = t(detail.brewing.leadKey);
            leadEl.hidden = false;
        } else {
            leadEl.hidden = true;
        }

        if (detail.brewing.type === 'ritual' && detail.brewing.steps) {
            renderRitualSteps(body, detail.brewing);
        } else if (detail.brewing.type === 'methods' && detail.brewing.methods) {
            renderBrewMethods(body, detail.brewing.methods);
        }
    }

    function renderRitualSteps(container, brewing) {
        var rb = document.createElement('div');
        rb.className = 'sk-es-ritual-bottom';
        var steps = document.createElement('ul');
        steps.className = 'sk-es-steps';
        brewing.steps.forEach(function (stepKey, i) {
            var li = document.createElement('li');
            li.className = 'sk-es-step';
            var cap = t(stepKey);
            li.innerHTML =
                '<p class="sk-es-step-num">' + (i + 1) + '</p>' +
                '<p class="sk-es-step-caption" data-i18n="' + esc(stepKey) + '">' + esc(cap) + '</p>';
            steps.appendChild(li);
        });
        rb.appendChild(steps);

        if (brewing.badges) {
            var badges = document.createElement('div');
            badges.className = 'sk-es-badges';
            brewing.badges.forEach(function (b) {
                var d = document.createElement('div');
                d.className = 'sk-es-badge';
                var text = t(b.textKey);
                d.innerHTML = '<span class="sk-es-icon-badge">' + PRODUCTS.icon(b.icon) + '</span>' +
                    '<span class="sk-es-badge-text" data-i18n="' + esc(b.textKey) + '">' + esc(text) + '</span>';
                badges.appendChild(d);
            });
            rb.appendChild(badges);
        }
        container.appendChild(rb);
    }

    function renderBrewMethods(container, methods) {
        var wrap = document.createElement('div');
        wrap.className = 'sk-pd-brew-wrap';
        methods.forEach(function (m) {
            var col = document.createElement('div');
            col.className = 'sk-pd-brew';
            var html = '<h6 class="sk-pd-brew-title">' + esc(t(m.titleKey)) + '</h6>';
            if (m.steps) {
                html += '<div class="sk-pd-brew-steps">';
                m.steps.forEach(function (s) {
                    html += '<div class="sk-pd-brew-item">' +
                        '<p class="sk-pd-brew-label">' + esc(t(s.labelKey)) + '</p>' +
                        '<small class="sk-pd-brew-hint">' + esc(t(s.hintKey)) + '</small>' +
                        '</div>';
                });
                html += '</div>';
            }
            if (m.tipKey) {
                var tipLabel = m.tipLabelKey ? t(m.tipLabelKey) : t('proTip');
                html += '<div class="sk-pd-brew-tip"><small class="sk-pd-brew-hint"><strong>' + esc(tipLabel) + '</strong> ' + esc(t(m.tipKey)) + '</small></div>';
            }
            if (m.listKeys) {
                html += '<ul class="sk-pd-list">';
                m.listKeys.forEach(function (key) {
                    html += '<li><small class="sk-pd-bullet">\u2713</small> ' + esc(t(key)) + '</li>';
                });
                html += '</ul>';
            }
            col.innerHTML = html;
            wrap.appendChild(col);
        });
        container.appendChild(wrap);
    }

    /* ----------------------------------------------------------------
       Ingredients & origin  (hide empty nutrition / certifications)
       ---------------------------------------------------------------- */
    function renderIngredients(prod, detail) {
        var section = document.getElementById('pdIngredients');
        if (!section) return;
        var ing = detail.ingredients;

        /* Inline hairline between description and ingredients */
        var inlineRow = document.querySelector('.sk-pd-ingredients-hairline');
        if (!inlineRow) {
            inlineRow = document.createElement('div');
            inlineRow.className = 'sk-pd-ingredients-hairline';
            var desc = document.getElementById('pdDescription');
            if (desc) {
                var target = desc.querySelector('.sk-pd-desc-split');
                if (target) {
                    target.parentNode.insertBefore(inlineRow, target.nextSibling);
                }
            }
        }

        if (!ing) {
            section.hidden = true;
            if (inlineRow) inlineRow.hidden = true;
            return;
        }
        section.hidden = false;

        /* Show the merged label/value inline hairline */
        if (inlineRow) {
            inlineRow.hidden = false;
            var il = inlineRow.querySelector('.sk-pd-ingredients-label');
            if (!il) {
                il = document.createElement('p');
                il.className = 'sk-pd-ingredients-label';
                inlineRow.appendChild(il);
                var iv = document.createElement('p');
                iv.className = 'sk-pd-ingredients-value';
                inlineRow.appendChild(iv);
            }
            /* Use the first cell's label + value for the hairline */
            var firstRow = ing.rows[0];
            if (firstRow && firstRow[0]) {
                il.setAttribute('data-i18n', firstRow[0].labelKey);
                il.textContent = t(firstRow[0].labelKey);
                var iv = inlineRow.querySelector('.sk-pd-ingredients-value');
                iv.textContent = resolveCell(firstRow[0]);
            }
        }

        var eyebrow = section.querySelector('.sk-es-eyebrow-text');
        if (eyebrow) {
            eyebrow.setAttribute('data-i18n', ing.eyebrowKey);
            eyebrow.textContent = t(ing.eyebrowKey);
        }
        var title = section.querySelector('.sk-es-title');
        if (title) {
            title.setAttribute('data-i18n', ing.titleKey);
            title.textContent = t(ing.titleKey);
        }

        var io = section.querySelector('.sk-pd-io');
        if (!io) return;
        io.innerHTML = '';

        ing.rows.forEach(function (row) {
            var rowEl = document.createElement('div');
            rowEl.className = 'sk-pd-io-row';
            row.forEach(function (cell) {
                var cellEl = document.createElement('div');
                cellEl.className = 'sk-pd-io-cell';
                var label = document.createElement('p');
                label.className = 'sk-pd-io-label';
                label.setAttribute('data-i18n', cell.labelKey);
                label.textContent = t(cell.labelKey);
                cellEl.appendChild(label);

                var value = document.createElement('div');
                value.className = 'sk-pd-io-value';

                if (cell.valueKey) {
                    value.textContent = t(cell.valueKey);
                } else if (cell.htmlKey) {
                    value.innerHTML = t(cell.htmlKey);
                } else if (cell.tableKey) {
                    var raw = t(cell.tableKey);
                    if (raw && raw !== cell.tableKey) {
                        var table = document.createElement('table');
                        table.className = 'sk-pd-table';
                        var tbody = document.createElement('tbody');
                        var parts = raw.split(',');
                        for (var i = 0; i < parts.length - 1; i += 2) {
                            var tr = document.createElement('tr');
                            tr.innerHTML = '<td>' + esc(parts[i]) + '</td><td class="sk-pd-table--end">' + esc(parts[i + 1]) + '</td>';
                            tbody.appendChild(tr);
                        }
                        table.appendChild(tbody);
                        value.appendChild(table);
                    }
                } else if (cell.tagsKey) {
                    var tagsRaw = t(cell.tagsKey);
                    if (tagsRaw && tagsRaw !== cell.tagsKey) {
                        var tagsWrap = document.createElement('div');
                        tagsWrap.className = 'sk-pd-tags';
                        tagsRaw.split(',').forEach(function (tag) {
                            var span = document.createElement('span');
                            span.className = 'sk-pd-tag';
                            span.textContent = tag.trim();
                            tagsWrap.appendChild(span);
                        });
                        value.appendChild(tagsWrap);
                    }
                }

                cellEl.appendChild(value);
                rowEl.appendChild(cellEl);
            });
            io.appendChild(rowEl);
        });
    }

    function resolveCell(cell) {
        if (cell.valueKey) return t(cell.valueKey);
        if (cell.htmlKey) return t(cell.htmlKey);
        return '';
    }

    /* ----------------------------------------------------------------
       Reviews (hide entirely if no reviews; compute from data)
       ---------------------------------------------------------------- */
    function renderReviews(prod, detail) {
        var section = document.getElementById('pdReviews');
        if (!section) return;
        var rev = detail.reviews;
        if (!rev) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        var eyebrow = section.querySelector('.sk-pd-head .sk-es-eyebrow-text');
        if (eyebrow) {
            eyebrow.setAttribute('data-i18n', rev.eyebrowKey);
            eyebrow.textContent = t(rev.eyebrowKey);
        }

        var title = section.querySelector('.sk-pd-head .sk-es-title');
        if (title) {
            title.setAttribute('data-i18n', rev.headingKey);
            title.textContent = t(rev.headingKey);
        }

        section.querySelector('.sk-pd-score-num').textContent = rev.score;
        var stars = section.querySelector('.sk-pd-score .sk-pd-stars');
        stars.textContent = starString(rev.stars);
        stars.setAttribute('aria-label', rev.stars + ' out of 5 stars');

        /** FIX: render "Based on {count} reviews" with the real number **/
        var hint = section.querySelector('.sk-pd-score .sk-pd-brew-hint');
        hint.textContent = global.SKI18N.tCount('reviews.basedOn', rev.count);

        var bars = section.querySelector('.sk-pd-review-bars');
        bars.innerHTML = '';
        rev.distribution.forEach(function (pct, i) {
            var starNum = 5 - i;
            var bar = document.createElement('div');
            bar.className = 'sk-pd-bar';
            var label = document.createElement('span');
            label.className = 'sk-pd-bar-label';
            label.textContent = t('reviews.stars.' + starNum);
            var track = document.createElement('div');
            track.className = 'sk-pd-bar-track';
            var fill = document.createElement('div');
            fill.className = 'sk-pd-bar-fill' + (i === 0 ? '' : ' sk-pd-bar-fill--muted');
            fill.style.width = pct + '%';
            track.appendChild(fill);
            bar.appendChild(label);
            bar.appendChild(track);
            bars.appendChild(bar);
        });

        var list = section.querySelector('.sk-pd-review-list');
        list.innerHTML = '';
        rev.entries.forEach(function (e) {
            var article = document.createElement('article');
            article.className = 'sk-pd-review-entry';
            /** FIX: remove "Verified Purchase" from sample review metadata **/
            var metaText = t(e.metaKey);
            article.innerHTML =
                '<div class="sk-pd-review-head">' +
                '<strong class="sk-pd-review-author">' + esc(e.author) + '</strong>' +
                '<span class="sk-pd-stars" aria-label="' + e.stars + ' out of 5 stars">' + starString(e.stars) + '</span>' +
                '</div>' +
                '<p class="sk-pd-review-meta"><small>' + esc(metaText) + '</small></p>' +
                '<p class="sk-pd-desc">' + esc(t(e.textKey)) + '</p>';
            list.appendChild(article);
        });
    }

    /* ----------------------------------------------------------------
       "Discover other essences" carousel — current product excluded
       ---------------------------------------------------------------- */
    function renderOthers(slug) {
        var track = document.getElementById('skPdOthersTrack');
        if (!track) return;
        var ul = track.querySelector('.sk-es-others-list');
        if (!ul) return;

        /** FIX: current product excluded from the carousel **/
        var others = PRODUCTS.others(slug);
        ul.innerHTML = '';
        others.forEach(function (prod) {
            var li = document.createElement('li');
            li.className = 'sk-es-other';
            var link = document.createElement('a');
            link.className = 'sk-es-other-link';
            link.href = PRODUCTS.productUrl(prod.id);
            var media = document.createElement('span');
            media.className = 'sk-es-other-media sk-es-other-media--' + prod.tone;
            var img = document.createElement('img');
            img.className = 'sk-es-other-img';
            img.src = prod.image;
            img.alt = t(prod.altKey, prod.nameKey);
            img.setAttribute('data-i18n-attr', 'alt:' + prod.altKey);
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
            img.setAttribute('width', '427');
            img.setAttribute('height', '324');
            media.appendChild(img);
            link.appendChild(media);
            var nameSpan = document.createElement('span');
            nameSpan.className = 'sk-es-other-name';
            nameSpan.setAttribute('data-i18n', prod.nameKey);
            nameSpan.textContent = t(prod.nameKey);
            link.appendChild(nameSpan);
            var taglineSpan = document.createElement('span');
            taglineSpan.className = 'sk-es-other-tagline';
            taglineSpan.setAttribute('data-i18n', prod.taglineKey);
            taglineSpan.textContent = t(prod.taglineKey);
            link.appendChild(taglineSpan);
            li.appendChild(link);
            ul.appendChild(li);
        });
    }

    /* ----------------------------------------------------------------
       Title / meta
       ---------------------------------------------------------------- */
    function applyTitle(slug) {
        var prod = PRODUCTS.byId(slug);
        if (!prod) return;
        var name = t(prod.nameKey);
        document.title = name + ' — Sukoon';
        var meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', name + ' — ' + t(prod.taglineKey) + ' | Sukoon');
        }
    }

    /* ----------------------------------------------------------------
       Init
       ---------------------------------------------------------------- */
    function renderAll(slug, detail) {
        var prod = PRODUCTS.byId(slug);
        if (!prod || !detail) return;
        renderHero(slug, prod, detail);
        renderDescription(prod, detail);
        renderBrewing(prod, detail);
        renderIngredients(prod, detail);
        renderReviews(prod, detail);
        renderOthers(slug);
    }

    function init() {
        var slug = readEssence();
        var detail = PRODUCTS.details[slug];
        var prod = PRODUCTS.byId(slug);

        document.documentElement.setAttribute('data-essence', slug);
        document.body.setAttribute('data-essence', slug);

        /* Tag sections with data-bg for CSS spacing logic */
        var sections = document.querySelectorAll('.sk-es-section');
        sections.forEach(function (section) {
            section.setAttribute('data-bg', section.classList.contains('sk-es-section--navy') ? 'navy' : 'cream');
        });

        applyTitle(slug);
        renderGallery(slug);
        renderAll(slug, detail);
        initGallerySwap();

        /* Keep content in sync on language change */
        if (global.SKI18N) {
            global.SKI18N.onChange(function () {
                renderGallery(slug);
                renderAll(slug, detail);
                /* Re-translate static data-i18n nodes */
                global.SKI18N.apply(document, global.SKI18N.getLang());
            });
        }
    }

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);