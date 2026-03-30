<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isHovered = ref(false)

function startCreating() {
  router.push('/create')
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-cream)]">
    <!-- Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 bg-[var(--color-cream)]/95 backdrop-blur-sm border-b border-[var(--color-ink)]/10"
    >
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="font-[UnifrakturMaguntia] text-2xl text-[var(--color-ink)]">
          The Anda's Photo
        </div>
        <button
          @click="startCreating"
          class="px-6 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Playfair_Display] text-sm tracking-widest uppercase hover:bg-[var(--color-ink-light)] transition-colors"
        >
          Start Creating
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <!-- Background decorative elements -->
      <div class="absolute inset-0 paper-texture opacity-50"></div>
      <div
        class="absolute top-20 left-10 w-64 h-64 border border-[var(--color-beige)] rotate-12 opacity-20"
      ></div>
      <div
        class="absolute bottom-20 right-10 w-96 h-96 border border-[var(--color-beige)] -rotate-6 opacity-20"
      ></div>

      <div class="relative z-10 text-center max-w-5xl mx-auto px-6">
        <!-- Ornament -->
        <p class="text-[var(--color-accent)] tracking-[0.4em] uppercase text-xs font-[Inter] mb-6">
          ✦ Established MMXXIV ✦
        </p>

        <!-- Main Headline -->
        <h1
          class="font-[UnifrakturMaguntia] text-6xl md:text-8xl lg:text-9xl text-[var(--color-ink)] mb-6 leading-tight"
        >
          The Anda's Photo
        </h1>

        <!-- Divider -->
        <div class="flex items-center justify-center gap-4 mb-8">
          <div class="h-px w-24 bg-[var(--color-ink)]"></div>
          <span class="text-[var(--color-ink)] text-xs tracking-[0.3em] uppercase font-[Inter]"
            >Est. 2026</span
          >
          <div class="h-px w-24 bg-[var(--color-ink)]"></div>
        </div>

        <!-- Subtitle -->
        <p
          class="font-[Playfair_Display] text-xl md:text-2xl lg:text-3xl text-[var(--color-ink-light)] italic mb-4 max-w-3xl mx-auto leading-relaxed"
        >
          Create Your Own Newspaper Photo
        </p>
        <p
          class="font-[Lora] text-base text-[var(--color-accent)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Transform your photographs into stunning vintage newspaper and editorial magazine layouts.
          Choose from classic European templates, upload your photos, and generate print-ready
          results.
        </p>

        <!-- CTA -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="startCreating"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            class="group relative px-10 py-4 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Playfair_Display] text-lg tracking-widest uppercase transition-all duration-300 hover:bg-[var(--color-ink-light)] hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span class="relative z-10">Start Creating</span>
            <span
              class="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
            ></span>
          </button>
          <a
            href="#features"
            class="px-10 py-4 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-[Playfair_Display] text-lg tracking-widest uppercase hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-all duration-300"
          >
            Learn More
          </a>
        </div>

        <!-- Preview Cards -->
        <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div
            class="bg-[var(--color-paper)] border border-[var(--color-ink)]/20 p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500 vintage-shadow"
          >
            <div
              class="aspect-[3/4] bg-[var(--color-cream-dark)] flex items-center justify-center border border-[var(--color-ink)]/10"
            >
              <div class="text-center p-4">
                <div class="font-[UnifrakturMaguntia] text-lg mb-2">The Daily Chronicle</div>
                <div class="h-px w-16 bg-[var(--color-ink)]/30 mx-auto mb-2"></div>
                <div class="w-full h-16 bg-[var(--color-ink)]/5 mb-2"></div>
                <div class="grid grid-cols-3 gap-1">
                  <div class="h-8 bg-[var(--color-ink)]/5"></div>
                  <div class="h-8 bg-[var(--color-ink)]/5"></div>
                  <div class="h-8 bg-[var(--color-ink)]/5"></div>
                </div>
              </div>
            </div>
            <p
              class="text-center mt-2 text-xs tracking-widest uppercase font-[Inter] text-[var(--color-accent)]"
            >
              Classic Newspaper
            </p>
          </div>

          <div
            class="bg-white border border-[var(--color-ink)]/20 p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500 vintage-shadow"
          >
            <div class="aspect-[3/4] bg-[var(--color-ink)]/5 flex items-center justify-center">
              <div class="text-center p-4 w-full">
                <div class="w-full h-24 bg-[var(--color-ink)]/10 mb-3"></div>
                <div class="font-[Playfair_Display] text-lg italic mb-1">Editorial</div>
                <div class="text-[8px] tracking-widest uppercase text-[var(--color-accent)]">
                  Magazine Style
                </div>
                <div class="grid grid-cols-2 gap-1 mt-3">
                  <div class="h-12 bg-[var(--color-ink)]/5"></div>
                  <div class="h-12 bg-[var(--color-ink)]/5"></div>
                </div>
              </div>
            </div>
            <p
              class="text-center mt-2 text-xs tracking-widest uppercase font-[Inter] text-[var(--color-accent)]"
            >
              Magazine Editorial
            </p>
          </div>

          <div
            class="bg-[var(--color-paper)] border border-[var(--color-ink)]/20 p-4 transform -rotate-1 hover:rotate-0 transition-transform duration-500 vintage-shadow"
          >
            <div class="aspect-[3/4] flex items-center justify-center">
              <div class="text-center p-6 w-full">
                <div class="text-xs tracking-[0.4em] uppercase text-[var(--color-accent)] mb-3">
                  ✦ Est. 2026 ✦
                </div>
                <div class="font-[Playfair_Display] text-xl font-bold tracking-widest mb-3">
                  PORTRAIT
                </div>
                <div class="h-px w-12 bg-[var(--color-ink)]/30 mx-auto mb-3"></div>
                <div class="w-3/4 mx-auto h-20 bg-[var(--color-ink)]/5 mb-2"></div>
                <div class="grid grid-cols-2 gap-1 w-3/4 mx-auto">
                  <div class="h-8 bg-[var(--color-ink)]/5"></div>
                  <div class="h-8 bg-[var(--color-ink)]/5"></div>
                </div>
              </div>
            </div>
            <p
              class="text-center mt-2 text-xs tracking-widest uppercase font-[Inter] text-[var(--color-accent)]"
            >
              Minimal Retro
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-[var(--color-paper)]">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <div class="flex items-center justify-center gap-4 mb-6">
            <div class="h-px w-16 bg-[var(--color-ink)]/30"></div>
            <span class="text-xs tracking-[0.4em] uppercase font-[Inter] text-[var(--color-accent)]"
              >How It Works</span
            >
            <div class="h-px w-16 bg-[var(--color-ink)]/30"></div>
          </div>
          <h2
            class="font-[Playfair_Display] text-4xl md:text-5xl font-bold text-[var(--color-ink)] mb-4"
          >
            From Photo to Print
          </h2>
          <p class="font-[Lora] text-lg text-[var(--color-ink-light)] italic max-w-2xl mx-auto">
            Transform your photographs into beautifully crafted newspaper layouts in just a few
            simple steps
          </p>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 border-2 border-[var(--color-ink)] flex items-center justify-center group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-cream)] transition-all duration-300"
            >
              <span class="text-2xl font-[Playfair_Display] font-bold">1</span>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold mb-2">Choose Template</h3>
            <p class="font-[Inter] text-sm text-[var(--color-ink-light)] leading-relaxed">
              Select from classic newspaper, editorial magazine, or minimal retro layouts in A4 or
              A3 format
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 border-2 border-[var(--color-ink)] flex items-center justify-center group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-cream)] transition-all duration-300"
            >
              <span class="text-2xl font-[Playfair_Display] font-bold">2</span>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold mb-2">Upload Photos</h3>
            <p class="font-[Inter] text-sm text-[var(--color-ink-light)] leading-relaxed">
              Upload your photographs and drag them into the template slots. Apply vintage filters
              for that authentic feel
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 border-2 border-[var(--color-ink)] flex items-center justify-center group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-cream)] transition-all duration-300"
            >
              <span class="text-2xl font-[Playfair_Display] font-bold">3</span>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold mb-2">Customize Text</h3>
            <p class="font-[Inter] text-sm text-[var(--color-ink-light)] leading-relaxed">
              Edit headlines, captions, and article text. Personalize every detail of your newspaper
              layout
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 border-2 border-[var(--color-ink)] flex items-center justify-center group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-cream)] transition-all duration-300"
            >
              <span class="text-2xl font-[Playfair_Display] font-bold">4</span>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold mb-2">Export & Print</h3>
            <p class="font-[Inter] text-sm text-[var(--color-ink-light)] leading-relaxed">
              Download as high-quality PNG, JPG or PDF. Ready for printing and sharing
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Templates Preview -->
    <section class="py-24 bg-[var(--color-cream)]">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="flex items-center justify-center gap-4 mb-6">
            <div class="h-px w-16 bg-[var(--color-ink)]/30"></div>
            <span class="text-xs tracking-[0.4em] uppercase font-[Inter] text-[var(--color-accent)]"
              >Templates</span
            >
            <div class="h-px w-16 bg-[var(--color-ink)]/30"></div>
          </div>
          <h2
            class="font-[Playfair_Display] text-4xl md:text-5xl font-bold text-[var(--color-ink)] mb-4"
          >
            Classic Designs
          </h2>
          <p class="font-[Lora] text-lg text-[var(--color-ink-light)] italic">
            Inspired by the golden age of European print media
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Newspaper -->
          <div class="text-center">
            <div
              class="bg-[var(--color-paper)] newspaper-border p-6 mb-4 hover:vintage-shadow transition-shadow duration-300"
            >
              <div class="font-[UnifrakturMaguntia] text-xl mb-2">The Daily Chronicle</div>
              <div class="newspaper-divider-thick mb-3"></div>
              <div class="font-[Playfair_Display] text-sm font-bold uppercase tracking-wider mb-2">
                Breaking: Headlines Ahoy
              </div>
              <div
                class="w-full h-32 bg-[var(--color-cream-dark)] mb-2 flex items-center justify-center text-xs text-[var(--color-accent)]"
              >
                Main Photo
              </div>
              <div class="grid grid-cols-3 gap-1 mb-2">
                <div class="h-12 bg-[var(--color-cream-dark)]"></div>
                <div class="h-12 bg-[var(--color-cream-dark)]"></div>
                <div class="h-12 bg-[var(--color-cream-dark)]"></div>
              </div>
              <div class="text-[7px] text-[var(--color-ink-light)] leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fringilla orci
                vel.
              </div>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold">Classic Newspaper</h3>
            <p class="text-sm text-[var(--color-accent)] font-[Inter]">A4 & A3 formats</p>
          </div>

          <!-- Magazine -->
          <div class="text-center">
            <div
              class="bg-white newspaper-border p-6 mb-4 hover:vintage-shadow transition-shadow duration-300"
            >
              <div
                class="w-full h-32 bg-[var(--color-ink)]/5 mb-3 flex items-center justify-center text-xs text-[var(--color-accent)]"
              >
                Hero Photo
              </div>
              <div class="font-[Playfair_Display] text-2xl italic mb-1">The Art of</div>
              <div class="font-[Playfair_Display] text-2xl italic mb-2">Elegance</div>
              <div class="text-[8px] tracking-widest uppercase text-[var(--color-accent)] mb-2">
                Photography by Studio
              </div>
              <div class="h-px w-8 bg-[var(--color-ink)]/30 mb-2"></div>
              <div class="text-[7px] text-[var(--color-ink-light)] leading-relaxed">
                In the quiet elegance of everyday moments lies a beauty that defies description.
              </div>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold">Magazine Editorial</h3>
            <p class="text-sm text-[var(--color-accent)] font-[Inter]">A4 & A3 formats</p>
          </div>

          <!-- Minimal -->
          <div class="text-center">
            <div
              class="bg-[var(--color-paper)] newspaper-border p-6 mb-4 hover:vintage-shadow transition-shadow duration-300"
            >
              <div class="text-[8px] tracking-[0.4em] uppercase text-[var(--color-accent)] mb-2">
                ✦ Est. 2026 ✦
              </div>
              <div class="font-[Playfair_Display] text-xl font-bold tracking-[0.3em] mb-2">
                PORTRAIT
              </div>
              <div class="h-px w-12 bg-[var(--color-ink)]/30 mx-auto mb-3"></div>
              <div class="font-[Lora] italic text-xs mb-3">A Study in Light & Shadow</div>
              <div
                class="w-2/3 mx-auto h-32 bg-[var(--color-cream-dark)] mb-2 flex items-center justify-center text-xs text-[var(--color-accent)]"
              >
                Your Photo
              </div>
              <div class="grid grid-cols-2 gap-1 w-2/3 mx-auto">
                <div class="h-10 bg-[var(--color-cream-dark)]"></div>
                <div class="h-10 bg-[var(--color-cream-dark)]"></div>
              </div>
            </div>
            <h3 class="font-[Playfair_Display] text-lg font-semibold">Minimal Retro</h3>
            <p class="text-sm text-[var(--color-accent)] font-[Inter]">A4 format</p>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center mt-16">
          <button
            @click="startCreating"
            class="px-12 py-4 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Playfair_Display] text-lg tracking-widest uppercase hover:bg-[var(--color-ink-light)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create Your Newspaper
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-[var(--color-ink)] text-[var(--color-cream)]">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <div class="font-[UnifrakturMaguntia] text-3xl mb-4">The Anda's Photo</div>
        <div class="h-px w-24 bg-[var(--color-cream)]/20 mx-auto mb-4"></div>
        <p class="font-[Inter] text-sm tracking-widest uppercase text-[var(--color-cream)]/60">
          © 2026 — Crafted with care · All rights reserved
        </p>
      </div>
    </footer>
  </div>
</template>
