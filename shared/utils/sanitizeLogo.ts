export function sanitizeLogo(url?: string) {
  return url ? url.split('&')[0] : '/no_image.png'
}
