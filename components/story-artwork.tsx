export type StoryArtworkKind = "strategy" | "brand" | "website" | "software" | "automation" | "growth";

export function StoryArtwork({ kind }: { kind: StoryArtworkKind }) {
  return <svg className="story-artwork" viewBox="0 0 600 320" fill="none" aria-hidden="true">
    <g className="story-artwork-grid">
      <path d="M30 80H570M30 160H570M30 240H570M120 20V300M240 20V300M360 20V300M480 20V300" />
      <path d="M30 20H570V300H30Z" />
    </g>

    {kind === "strategy" && <g className="story-artwork-drawing">
      <circle className="art-soft" cx="300" cy="160" r="116" />
      <circle className="art-soft art-dash" cx="300" cy="160" r="79" />
      <path className="art-soft" d="M300 20V300M160 160H440M217 77L383 243M383 77L217 243" />
      <path className="art-line" d="M300 43A117 117 0 0 1 417 160M184 160A116 116 0 0 1 300 44" />
      <path className="art-accent" d="M300 102L354 160L300 218L246 160Z" />
      <circle className="art-fill art-pulse" cx="300" cy="160" r="13" />
      <circle className="art-fill" cx="416" cy="160" r="5" />
      <circle className="art-fill" cx="218" cy="78" r="5" />
      <circle className="art-fill" cx="183" cy="160" r="5" />
    </g>}

    {kind === "brand" && <g className="story-artwork-drawing">
      <circle className="art-soft" cx="299" cy="160" r="114" />
      <path className="art-soft" d="M163 198L275 86L387 198L275 310ZM212 115H442V254H212Z" />
      <path className="art-line" d="M194 229L293 68L406 229L309 274Z" />
      <path className="art-accent" d="M264 215V105H356L341 129H292V151H336L321 175H292V215Z" />
      <circle className="art-fill art-pulse" cx="406" cy="229" r="8" />
      <circle className="art-fill" cx="194" cy="229" r="5" />
      <circle className="art-fill" cx="293" cy="68" r="5" />
    </g>}

    {kind === "website" && <g className="story-artwork-drawing">
      <rect className="art-line" x="116" y="48" width="352" height="222" rx="7" />
      <path className="art-soft" d="M116 83H468M140 65H150M158 65H168M176 65H186" />
      <rect className="art-soft" x="140" y="105" width="190" height="78" rx="3" />
      <path className="art-accent" d="M153 162L198 123L233 146L273 116L316 159" />
      <path className="art-line" d="M140 202H286M140 219H258M140 239H218" />
      <rect className="art-soft" x="349" y="104" width="91" height="70" rx="3" />
      <rect className="art-soft" x="349" y="188" width="91" height="58" rx="3" />
      <path className="art-fill art-pulse" d="M401 143L419 163L412 165L408 176L401 173L397 162L390 158Z" />
    </g>}

    {kind === "software" && <g className="story-artwork-drawing">
      <path className="art-soft art-dash" d="M201 108H301V160H397M201 215H301V160M397 215H301" />
      <rect className="art-line" x="121" y="63" width="160" height="91" rx="6" />
      <rect className="art-line" x="319" y="63" width="160" height="91" rx="6" />
      <rect className="art-line" x="121" y="172" width="160" height="91" rx="6" />
      <rect className="art-line" x="319" y="172" width="160" height="91" rx="6" />
      <path className="art-soft" d="M121 89H281M319 89H479M121 198H281M319 198H479" />
      <path className="art-accent" d="M177 110L163 122L177 134M225 110L239 122L225 134M210 105L194 139M360 112H439M360 127H412M161 221H240M161 237H212M359 222H439M359 237H403" />
      <circle className="art-fill art-pulse" cx="301" cy="160" r="10" />
    </g>}

    {kind === "automation" && <g className="story-artwork-drawing">
      <path className="art-soft" d="M68 161H145M455 161H532" />
      <path className="art-line art-flow" d="M145 161C200 161 186 90 247 90H354C415 90 402 161 455 161M145 161C200 161 187 233 247 233H354C415 233 401 161 455 161" />
      <circle className="art-line" cx="145" cy="161" r="34" />
      <circle className="art-line" cx="300" cy="90" r="34" />
      <circle className="art-line" cx="300" cy="233" r="34" />
      <circle className="art-line" cx="455" cy="161" r="34" />
      <path className="art-accent" d="M132 161H158M145 148V174M286 90H314M286 233H314M442 161H467M456 148L469 161L456 174" />
      <circle className="art-fill art-pulse" cx="300" cy="161" r="8" />
      <path className="art-soft art-dash" d="M300 125V198" />
    </g>}

    {kind === "growth" && <g className="story-artwork-drawing">
      <path className="art-soft" d="M111 250H493M111 250V47M111 200H493M111 150H493M111 100H493M190 50V250M270 50V250M350 50V250M430 50V250" />
      <path className="art-soft art-dash" d="M121 221L202 196L280 206L355 133L424 150L493 70" />
      <path className="art-accent art-flow" d="M121 221L202 196L280 206L355 133L424 150L493 70" />
      <path className="art-accent" d="M459 70H493V104" />
      <circle className="art-fill" cx="202" cy="196" r="6" />
      <circle className="art-fill" cx="280" cy="206" r="6" />
      <circle className="art-fill" cx="355" cy="133" r="6" />
      <circle className="art-fill" cx="424" cy="150" r="6" />
      <circle className="art-fill art-pulse" cx="493" cy="70" r="9" />
    </g>}
  </svg>;
}
