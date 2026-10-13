/** A color with a broadly supported fallback and its preferred modern value. */
export interface ColorToken {
  readonly fallback: string;
  readonly modern: string;
}

export type TokenValue = string | ColorToken | TokenTree;

/** Recursive shape consumed by build-time token generators. */
export interface TokenTree {
  readonly [name: string]: TokenValue;
}

interface ColorScale extends TokenTree {
  readonly 50: ColorToken;
  readonly 100: ColorToken;
  readonly 500: ColorToken;
  readonly 600: ColorToken;
  readonly 700: ColorToken;
  readonly 900: ColorToken;
}

interface NeutralColorScale extends ColorScale {
  readonly 0: ColorToken;
  readonly 200: ColorToken;
  readonly 300: ColorToken;
  readonly 400: ColorToken;
  readonly 800: ColorToken;
  readonly 950: ColorToken;
}

export interface PrimitiveTokens extends TokenTree {
  readonly color: {
    readonly neutral: NeutralColorScale;
    readonly accent: ColorScale;
    readonly danger: ColorScale;
    readonly success: ColorScale;
    readonly warning: ColorScale;
  };
  readonly font: {
    readonly family: TokenTree;
    readonly size: TokenTree;
    readonly weight: TokenTree;
    readonly lineHeight: TokenTree;
  };
  readonly space: TokenTree;
  readonly control: TokenTree;
  readonly radius: TokenTree;
  readonly border: TokenTree;
  readonly shadow: TokenTree;
  readonly motion: {
    readonly duration: TokenTree;
    readonly easing: TokenTree;
  };
  readonly zIndex: TokenTree;
}

export interface SemanticTokenTree extends TokenTree {
  readonly surface: TokenTree;
  readonly content: TokenTree;
  readonly border: TokenTree;
  readonly interactive: TokenTree;
  readonly focus: TokenTree;
  readonly shadow: TokenTree;
}

export type ThemeName = 'light' | 'dark';

/** Attribute used for an explicit theme override on a document subtree. */
export const themeAttribute = 'data-morfira-theme' as const;

const color = (fallback: string, modern: string): ColorToken => ({ fallback, modern });

export const primitiveTokens: PrimitiveTokens = {
  color: {
    neutral: {
      0: color('#ffffff', 'oklch(100% 0 0)'),
      50: color('#f7f8fa', 'oklch(98% 0.004 264)'),
      100: color('#eef0f4', 'oklch(95.5% 0.008 264)'),
      200: color('#dde1e8', 'oklch(90.5% 0.014 264)'),
      300: color('#c4cad5', 'oklch(83.5% 0.022 264)'),
      400: color('#9aa3b2', 'oklch(71% 0.032 264)'),
      500: color('#707b8c', 'oklch(58.5% 0.038 264)'),
      600: color('#515c6c', 'oklch(47% 0.036 264)'),
      700: color('#3a4350', 'oklch(38% 0.03 264)'),
      800: color('#252b35', 'oklch(28.5% 0.024 264)'),
      900: color('#171b22', 'oklch(21% 0.018 264)'),
      950: color('#0d1015', 'oklch(15.5% 0.014 264)'),
    },
    accent: {
      50: color('#f3f2ff', 'oklch(97% 0.018 285)'),
      100: color('#e8e5ff', 'oklch(93.5% 0.038 285)'),
      500: color('#6759f5', 'oklch(61% 0.22 285)'),
      600: color('#5647db', 'oklch(55% 0.21 285)'),
      700: color('#4639b5', 'oklch(48% 0.18 285)'),
      900: color('#302978', 'oklch(34% 0.12 285)'),
    },
    danger: {
      50: color('#fff1f2', 'oklch(97% 0.014 18)'),
      100: color('#ffe1e4', 'oklch(93.5% 0.035 18)'),
      500: color('#e5485d', 'oklch(62% 0.2 18)'),
      600: color('#c9364d', 'oklch(55% 0.19 18)'),
      700: color('#a52b40', 'oklch(48% 0.16 18)'),
      900: color('#661d2c', 'oklch(34% 0.11 18)'),
    },
    success: {
      50: color('#eefbf3', 'oklch(97% 0.025 150)'),
      100: color('#d8f5e3', 'oklch(93.5% 0.055 150)'),
      500: color('#28a867', 'oklch(65% 0.15 150)'),
      600: color('#208a55', 'oklch(56% 0.13 150)'),
      700: color('#1d7048', 'oklch(49% 0.105 150)'),
      900: color('#15452f', 'oklch(34% 0.07 150)'),
    },
    warning: {
      50: color('#fff8e6', 'oklch(98% 0.035 85)'),
      100: color('#ffefbf', 'oklch(95% 0.075 85)'),
      500: color('#d98a00', 'oklch(70% 0.16 70)'),
      600: color('#b66d00', 'oklch(61% 0.15 70)'),
      700: color('#925500', 'oklch(52% 0.13 70)'),
      900: color('#573500', 'oklch(36% 0.09 70)'),
    },
  },
  font: {
    family: {
      sans: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      snug: '1.35',
      normal: '1.5',
      relaxed: '1.65',
    },
  },
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  control: {
    sizeSm: '2rem',
    sizeMd: '2.5rem',
    sizeLg: '3rem',
    touchTarget: '2.75rem',
  },
  radius: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  border: {
    thin: '1px',
    thick: '2px',
  },
  shadow: {
    raw: {
      sm: '0 1px 2px rgb(13 16 21 / 0.08)',
      md: '0 8px 24px rgb(13 16 21 / 0.12)',
      lg: '0 18px 48px rgb(13 16 21 / 0.18)',
    },
  },
  motion: {
    duration: {
      instant: '0ms',
      fast: '120ms',
      normal: '180ms',
      slow: '280ms',
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      entrance: 'cubic-bezier(0, 0, 0, 1)',
      exit: 'cubic-bezier(0.3, 0, 1, 1)',
    },
  },
  zIndex: {
    base: '0',
    raised: '10',
    dropdown: '1000',
    overlay: '1100',
    modal: '1200',
    toast: '1300',
  },
};

export const lightThemeTokens: SemanticTokenTree = {
  surface: {
    canvas: 'var(--morfira-color-neutral-0)',
    subtle: 'var(--morfira-color-neutral-50)',
    raised: 'var(--morfira-color-neutral-0)',
    sunken: 'var(--morfira-color-neutral-100)',
    inverse: 'var(--morfira-color-neutral-900)',
  },
  content: {
    primary: 'var(--morfira-color-neutral-900)',
    secondary: 'var(--morfira-color-neutral-600)',
    muted: 'var(--morfira-color-neutral-500)',
    inverse: 'var(--morfira-color-neutral-0)',
    accent: 'var(--morfira-color-accent-700)',
    danger: 'var(--morfira-color-danger-700)',
    success: 'var(--morfira-color-success-700)',
    warning: 'var(--morfira-color-warning-700)',
  },
  border: {
    subtle: 'var(--morfira-color-neutral-200)',
    default: 'var(--morfira-color-neutral-300)',
    strong: 'var(--morfira-color-neutral-500)',
    danger: 'var(--morfira-color-danger-500)',
  },
  interactive: {
    primary: 'var(--morfira-color-accent-600)',
    primaryHover: 'var(--morfira-color-accent-700)',
    primaryActive: 'var(--morfira-color-accent-900)',
    primaryContent: 'var(--morfira-color-neutral-0)',
    disabled: 'var(--morfira-color-neutral-200)',
    disabledContent: 'var(--morfira-color-neutral-500)',
  },
  focus: {
    ring: 'var(--morfira-color-accent-500)',
    offset: 'var(--morfira-color-neutral-0)',
  },
  shadow: {
    sm: 'var(--morfira-shadow-raw-sm)',
    md: 'var(--morfira-shadow-raw-md)',
    lg: 'var(--morfira-shadow-raw-lg)',
  },
};

export const darkThemeTokens: SemanticTokenTree = {
  surface: {
    canvas: 'var(--morfira-color-neutral-950)',
    subtle: 'var(--morfira-color-neutral-900)',
    raised: 'var(--morfira-color-neutral-900)',
    sunken: 'var(--morfira-color-neutral-950)',
    inverse: 'var(--morfira-color-neutral-50)',
  },
  content: {
    primary: 'var(--morfira-color-neutral-50)',
    secondary: 'var(--morfira-color-neutral-300)',
    muted: 'var(--morfira-color-neutral-400)',
    inverse: 'var(--morfira-color-neutral-950)',
    accent: 'var(--morfira-color-accent-100)',
    danger: 'var(--morfira-color-danger-100)',
    success: 'var(--morfira-color-success-100)',
    warning: 'var(--morfira-color-warning-100)',
  },
  border: {
    subtle: 'var(--morfira-color-neutral-800)',
    default: 'var(--morfira-color-neutral-700)',
    strong: 'var(--morfira-color-neutral-500)',
    danger: 'var(--morfira-color-danger-500)',
  },
  interactive: {
    primary: 'var(--morfira-color-accent-500)',
    primaryHover: 'var(--morfira-color-accent-100)',
    primaryActive: 'var(--morfira-color-accent-50)',
    primaryContent: 'var(--morfira-color-neutral-950)',
    disabled: 'var(--morfira-color-neutral-800)',
    disabledContent: 'var(--morfira-color-neutral-400)',
  },
  focus: {
    ring: 'var(--morfira-color-accent-100)',
    offset: 'var(--morfira-color-neutral-950)',
  },
  shadow: {
    sm: 'var(--morfira-shadow-raw-sm)',
    md: 'var(--morfira-shadow-raw-md)',
    lg: 'var(--morfira-shadow-raw-lg)',
  },
};
