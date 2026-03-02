// API клиент — все запросы к бэкенду

import axios from 'axios';

const USER_ID = 'user_demo'; // В реальном проде — из сессии/JWT

const api = axios.create({
  baseURL: '/api',
  headers: { 'x-user-id': USER_ID },
});

// ── TRANSCRIPTION ─────────────────────────────────────────────────────────────

export async function transcribeAudio({ audioFile, language = 'auto', stylePreset }) {
  const form = new FormData();
  form.append('audio', audioFile);
  form.append('language', language);
  if (stylePreset) form.append('stylePreset', stylePreset);
  const { data } = await api.post('/transcribe', form);
  return data;
}

// ── TRANSLATION ───────────────────────────────────────────────────────────────

export async function translateCaptions({ captions, targetLanguage }) {
  const { data } = await api.post('/translate-captions', { captions, targetLanguage });
  return data;
}

// ── EXPORT SRT ────────────────────────────────────────────────────────────────

export async function exportSRT({ captions, filename }) {
  const { data } = await api.post('/export-srt', { captions, filename }, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.srt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── GENERATE CREATIVES ────────────────────────────────────────────────────────

export async function generateCreatives({
  videoFile,
  offerId,
  platforms,
  scenario,
  inputLanguage,
  translateTo,
  durationType,
  customDuration,
  subtitleStyle,
  uniqIntensity,
  variations,
  generateThumbs,
  calcBanScore,
  saveAsPreset,
  uniqMode,
}) {
  const form = new FormData();
  form.append('video', videoFile);
  if (offerId) form.append('offerId', offerId);
  form.append('platforms', JSON.stringify(platforms));
  form.append('scenario', scenario);
  form.append('inputLanguage', inputLanguage);
  if (translateTo) form.append('translateTo', translateTo);
  form.append('durationType', durationType);
  if (customDuration) form.append('customDuration', String(customDuration));
  form.append('subtitleStyle', subtitleStyle);
  form.append('uniqIntensity', String(uniqIntensity));
  form.append('variations', String(variations));
  form.append('generateThumbs', generateThumbs ? 'true' : 'false');
  form.append('calcBanScore', calcBanScore ? 'true' : 'false');
  form.append('saveAsPreset', saveAsPreset ? 'true' : 'false');
  if (uniqMode) form.append('uniqMode', uniqMode);

  const { data } = await api.post('/generate-creatives', form);
  return data;
}

// ── YOUTUBE IMPORT ────────────────────────────────────────────────────────────

export async function importYoutube({ url, mode, start, end }) {
  const { data } = await api.post('/import-youtube', { url, mode, start, end });
  return data;
}

// ── OFFERS ────────────────────────────────────────────────────────────────────

export async function getOffers() {
  const { data } = await api.get('/offers');
  return data.offers;
}

export async function createOffer({ name, geo, note }) {
  const { data } = await api.post('/offers', { name, geo, note });
  return data.offer;
}

export async function deleteOffer(id) {
  await api.delete(`/offers/${id}`);
}

// ── CREATIVES ─────────────────────────────────────────────────────────────────

export async function getCreatives({ offerId } = {}) {
  const { data } = await api.get('/creatives', { params: offerId ? { offerId } : {} });
  return data.creatives;
}

// ── USER ──────────────────────────────────────────────────────────────────────

export async function getMe() {
  const { data } = await api.get('/me');
  return data;
}
