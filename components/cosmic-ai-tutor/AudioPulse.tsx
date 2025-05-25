/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "./AudioPulse.css";
import React from "react";
import { useEffect, useRef } from "react";

const lineCount = 3;

export interface AudioPulseProps {
  active: boolean;
  volume: number;
  hover?: boolean;
}

// Simple classnames utility to replace the external dependency
const classNames = (...classes: (string | { [key: string]: boolean | undefined } | undefined)[]): string => {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ');
};

const AudioPulse: React.FC<AudioPulseProps> = ({ active, volume, hover = false }) => {
  const lines = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let timeoutId: number | null = null;
    const update = () => {
      if (lines.current) {
        lines.current.forEach(
          (line, i) => {
            if (line) {
              line.style.height = `${Math.min(
                24,
                4 + volume * (i === 1 ? 400 : 60), // Center line is more sensitive
              )}px`;
            }
          }
        );
      }
      timeoutId = window.setTimeout(update, 100);
    };

    update();

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [volume]);

  return (
    <div className={classNames("audioPulse", { active, hover })}>
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) lines.current[i] = el;
            }}
            style={{ animationDelay: `${i * 133}ms` }}
          />
        ))}
    </div>
  );
};

export default AudioPulse;
