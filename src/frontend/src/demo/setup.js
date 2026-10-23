import axios from 'axios';
import { installDemoFallback } from './api';

// Imported before the app so the very first API request is covered
installDemoFallback(axios);
