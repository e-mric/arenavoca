/** Vega local playback expects a filesystem path; remote streams keep their URL. */
export function mediaSource(uri: string): string {
  return uri.startsWith('file:///') ? decodeURI(uri.slice(7)) : uri;
}
