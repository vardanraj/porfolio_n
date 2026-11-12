import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { initNetworkCanvas } from './js/canvas.js';
import { initCursor } from './js/cursor.js';
import { initAnimations } from './js/animations.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initNetworkCanvas(prefersReducedMotion);
initCursor(prefersReducedMotion);
initAnimations(prefersReducedMotion);
