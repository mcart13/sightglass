type RichTextElement = Element & {
  innerHTML: string;
};

const toRichTextElement = (target: Element): RichTextElement =>
  target as RichTextElement;

export const serializeRichText = (target: Element): string => {
  return toRichTextElement(target).innerHTML;
};

export const restoreRichText = (target: Element, markup: string): void => {
  toRichTextElement(target).innerHTML = markup;
};
