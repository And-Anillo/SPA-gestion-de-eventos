// src/main.js
import './css/styles.css'
import { router } from './js/router.js'

window.addEventListener('DOMContentLoaded', router)
window.addEventListener('hashchange', router)
