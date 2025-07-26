/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const bundleDir = join(root, 'bundle');

// Create the bundle directory if it doesn't exist
if (!existsSync(bundleDir)) {
  mkdirSync(bundleDir);
}

// Find and copy all .sb files from packages to the root of the bundle directory
const sbFiles = glob.sync('packages/**/*.sb', { cwd: root });
for (const file of sbFiles) {
  copyFileSync(join(root, file), join(bundleDir, basename(file)));
}

// Copy .env file to bundle directory
const envSource = join(root, '.env');
const envDest = join(bundleDir, '.env');

if (existsSync(envSource)) {
  copyFileSync(envSource, envDest);
  console.log('✅ Copied .env to bundle directory');
} else {
  console.log('⚠️  .env file not found, skipping copy');
}

// Copy internal-web-config.json if exists
const configSource = join(root, 'internal-web-config.json');
const configDest = join(bundleDir, 'internal-web-config.json');

if (existsSync(configSource)) {
  copyFileSync(configSource, configDest);
  console.log('✅ Copied internal-web-config.json to bundle directory');
} else {
  console.log('ℹ️  internal-web-config.json not found, skipping copy');
}

console.log('Assets copied to bundle/');
