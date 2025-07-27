/**
 * Output action choice
 */
export type OutputChoice = {
  name: string
  value: 'clipboard' | 'editor' | 'both' | 'nothing' | 'bitbucket' | 'github'
}
