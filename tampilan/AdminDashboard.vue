<template>
  <div class="flex min-h-screen text-[#1d1b20]" style="background: radial-gradient(circle at top left, #fdf7ff, #f2ecf4); font-family: 'Inter', sans-serif; overflow-x: hidden;">
    
    <!-- SIDEBAR -->
    <aside class="glass-panel w-72 h-screen sticky top-0 flex flex-col p-6 z-40 border-r-0 rounded-r-3xl deep-shadow">
      <div class="mb-10 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f378a] to-[#6750a4] flex items-center justify-center shadow-lg border-t border-white/40">
          <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">badge</span>
        </div>
        <div>
          <h1 class="text-[24px] leading-[1.3] font-bold text-[#4f378a] tracking-tight">AfriChina</h1>
          <p class="text-[10px] font-bold text-[#7a7582] tracking-widest uppercase">Admin Terminal</p>
        </div>
      </div>

      <nav class="flex-1 space-y-3">
        <!-- Active Nav Item -->
        <a class="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white shadow-lg lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
            <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">dashboard</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Dashboard</span>
        </a>
        
        <!-- Inactive Nav Items -->
        <a class="flex items-center gap-4 px-4 py-3 rounded-xl text-[#494551] hover:bg-[#ece6ee] transition-all lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-[#e6e0e9] flex items-center justify-center shadow-sm border border-white/50">
            <span class="material-symbols-outlined text-xl text-[#4f378a]" style="font-variation-settings: 'FILL' 0;">request_quote</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Requests</span>
        </a>
        <a class="flex items-center gap-4 px-4 py-3 rounded-xl text-[#494551] hover:bg-[#ece6ee] transition-all lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-[#e6e0e9] flex items-center justify-center shadow-sm border border-white/50">
            <span class="material-symbols-outlined text-xl text-[#4f378a]" style="font-variation-settings: 'FILL' 0;">shopping_cart</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Orders</span>
        </a>
        <a class="flex items-center gap-4 px-4 py-3 rounded-xl text-[#494551] hover:bg-[#ece6ee] transition-all lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-[#e6e0e9] flex items-center justify-center shadow-sm border border-white/50">
            <span class="material-symbols-outlined text-xl text-[#4f378a]" style="font-variation-settings: 'FILL' 0;">business</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Suppliers</span>
        </a>
        <a class="flex items-center gap-4 px-4 py-3 rounded-xl text-[#494551] hover:bg-[#ece6ee] transition-all lift-effect group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-[#e6e0e9] flex items-center justify-center shadow-sm border border-white/50">
            <span class="material-symbols-outlined text-xl text-[#4f378a]" style="font-variation-settings: 'FILL' 0;">settings</span>
          </div>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Settings</span>
        </a>
      </nav>

      <!-- Profile Section -->
      <div class="mt-auto pt-6 border-t border-[#cbc4d2] space-y-4">
        <div class="flex items-center gap-3 p-2 rounded-2xl bg-[#f8f2fa] border border-white/30">
          <div class="relative">
            <div class="w-10 h-10 rounded-full border-2 border-[#4f378a] overflow-hidden shadow-md">
              <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBFvudkfDvkOa1ZX8iabOZgf7wS6ds4M1OJ3A7ncRwwxCHJXQTBmaFSmeZ0Gvpi1S5OKcuFFX2Fy46hzma15bZ5SZXanZoEpqOw0u9MzvuTN9b-Q0NvjeE30b-rrRwVYYgu1Bb3jOBTeWbUpOwuKBLjuLoVY7WKySqqOuucf51ilQwAE9TXo8cqh5AMwTo0nAmC9aSjvZx0Lw2YlXykO5F4X66Mun2KA4kYgLkRf_dEv17rpfGuZMp6pcnWRy4Vagnn_9a7Ss3s4xo" alt="Chen Wei"/>
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#1d1b20] truncate">Chen Wei</p>
            <p class="text-[10px] text-[#494551]">Chief Operations</p>
          </div>
        </div>
        <button @click="logout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e6e0e9] text-[#4f378a] font-semibold shadow-md hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors lift-effect">
          <span class="material-symbols-outlined text-xl">logout</span>
          <span class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 p-10 max-w-[1600px] mx-auto space-y-10">
      <!-- Header -->
      <header class="flex justify-between items-end gap-6">
        <div>
          <h2 class="text-[48px] leading-[1.1] tracking-[-0.02em] font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">All Requests</h2>
          <p class="text-[16px] leading-[1.6] font-normal text-[#494551]">Monitor and manage cross-border sourcing operations in real-time.</p>
        </div>
        <div class="flex gap-4 items-center">
          <div class="relative w-80">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7582]">search</span>
            <input 
              v-model="searchQuery"
              class="w-full pl-12 pr-4 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 text-[#1d1b20] placeholder:text-[#cbc4d2] outline-none" 
              placeholder="Search requests, buyers..." 
              type="text"
            />
          </div>
          <button @click="toggleFilters" class="glass-panel p-3 rounded-2xl flex items-center justify-center text-[#4f378a] hover:bg-white transition-all lift-effect">
            <span class="material-symbols-outlined">filter_list</span>
          </button>
          <button @click="createNewRequest" class="bg-[#4f378a] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#4f378a]/20 lift-effect border-t border-white/30">
            <span class="material-symbols-outlined">add</span>
            New Request
          </button>
        </div>
      </header>

      <!-- STATS GRID -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <!-- Total Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#4f378a]/10 flex items-center justify-center border border-[#4f378a]/20">
              <span class="material-symbols-outlined text-[#4f378a] text-2xl" style="font-variation-settings: 'FILL' 1;">assignment</span>
            </div>
            <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">+12.5%</span>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Total Requests</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">1,284</p>
          <div class="mt-4 h-12 w-full">
            <div class="flex items-end gap-1 h-full w-full">
              <div class="flex-1 bg-[#4f378a]/20 rounded-t-sm h-1/2 transition-all group-hover:h-2/3"></div>
              <div class="flex-1 bg-[#4f378a]/20 rounded-t-sm h-3/4 transition-all group-hover:h-full"></div>
              <div class="flex-1 bg-[#4f378a]/40 rounded-t-sm h-2/3"></div>
              <div class="flex-1 bg-[#4f378a]/30 rounded-t-sm h-4/5"></div>
              <div class="flex-1 bg-[#4f378a]/50 rounded-t-sm h-full"></div>
              <div class="flex-1 bg-[#4f378a]/40 rounded-t-sm h-5/6"></div>
              <div class="flex-1 bg-[#4f378a]/60 rounded-t-sm h-3/4"></div>
            </div>
          </div>
        </div>

        <!-- Pending Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <span class="material-symbols-outlined text-orange-600 text-2xl" style="font-variation-settings: 'FILL' 1;">hourglass_empty</span>
            </div>
            <span class="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">High Priority</span>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Pending Approval</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">42</p>
          <div class="mt-4 h-12 w-full">
            <div class="flex items-end gap-1 h-full w-full">
              <div class="flex-1 bg-orange-500/20 rounded-t-sm h-1/3"></div>
              <div class="flex-1 bg-orange-500/30 rounded-t-sm h-1/2"></div>
              <div class="flex-1 bg-orange-500/20 rounded-t-sm h-2/3"></div>
              <div class="flex-1 bg-orange-500/40 rounded-t-sm h-1/2"></div>
              <div class="flex-1 bg-orange-500/50 rounded-t-sm h-3/4"></div>
              <div class="flex-1 bg-orange-500/30 rounded-t-sm h-2/3"></div>
              <div class="flex-1 bg-orange-500/60 rounded-t-sm h-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Processing Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <span class="material-symbols-outlined text-blue-600 text-2xl" style="font-variation-settings: 'FILL' 1;">conveyor_belt</span>
            </div>
            <span class="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Active</span>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">In Processing</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">315</p>
          <div class="mt-4 h-12 w-full">
            <div class="flex items-end gap-1 h-full w-full">
              <div class="flex-1 bg-blue-500/30 rounded-t-sm h-2/3"></div>
              <div class="flex-1 bg-blue-500/40 rounded-t-sm h-3/4"></div>
              <div class="flex-1 bg-blue-500/20 rounded-t-sm h-full"></div>
              <div class="flex-1 bg-blue-500/50 rounded-t-sm h-5/6"></div>
              <div class="flex-1 bg-blue-500/30 rounded-t-sm h-3/4"></div>
              <div class="flex-1 bg-blue-500/60 rounded-t-sm h-2/3"></div>
              <div class="flex-1 bg-blue-500/40 rounded-t-sm h-4/5"></div>
            </div>
          </div>
        </div>

        <!-- Completed Card -->
        <div class="glass-panel p-6 rounded-3xl deep-shadow lift-effect relative overflow-hidden group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <span class="material-symbols-outlined text-green-600 text-2xl" style="font-variation-settings: 'FILL' 1;">task_alt</span>
            </div>
            <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">98% Success</span>
          </div>
          <h3 class="text-[#494551] text-[14px] leading-[1.2] tracking-[0.01em] font-semibold">Completed Deals</h3>
          <p class="text-[40px] leading-none font-extrabold mt-1 text-[#1d1b20]">892</p>
          <div class="mt-4 h-12 w-full">
            <div class="flex items-end gap-1 h-full w-full">
              <div class="flex-1 bg-green-500/20 rounded-t-sm h-4/5"></div>
              <div class="flex-1 bg-green-500/40 rounded-t-sm h-5/6"></div>
              <div class="flex-1 bg-green-500/30 rounded-t-sm h-full"></div>
              <div class="flex-1 bg-green-500/50 rounded-t-sm h-3/4"></div>
              <div class="flex-1 bg-green-500/60 rounded-t-sm h-full"></div>
              <div class="flex-1 bg-green-500/40 rounded-t-sm h-5/6"></div>
              <div class="flex-1 bg-green-500/70 rounded-t-sm h-4/5"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- TABLE SECTION -->
      <section class="glass-panel rounded-3xl deep-shadow overflow-hidden">
        <div class="p-6 border-b border-[#cbc4d2] flex justify-between items-center bg-white/30">
          <h4 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">Recent Sourcing Requests</h4>
          <div class="flex gap-2">
            <button @click="viewAll" class="px-4 py-2 text-sm font-bold bg-[#e6e0e9] rounded-xl text-[#4f378a] hover:bg-[#4f378a]/10 transition-all">View All</button>
            <button @click="exportCSV" class="px-4 py-2 text-sm font-bold bg-[#e6e0e9] rounded-xl text-[#4f378a] hover:bg-[#4f378a]/10 transition-all">Export CSV</button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[#7a7582] uppercase text-[11px] font-bold tracking-widest bg-[#f8f2fa]/50">
                <th class="px-8 py-4">Buyer Entity</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Request Date</th>
                <th class="px-6 py-4">Est. Volume</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#cbc4d2]/30">
              <!-- Row 1 -->
              <tr class="group hover:bg-gradient-to-r hover:from-[#4f378a]/5 hover:to-transparent transition-all cursor-pointer" @click="openStatusModal">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full border-2 border-[#4f378a]/30 p-0.5 overflow-hidden shadow-sm">
                      <img class="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB_07qR2a05wb8XOu4ejHpjJA4SdqX6YB2jzM3Nxr13P3ejmr6eGv3l_rzyvMUw1plCokCnJBLpvr4s6BT6EExPKlK_o7HNgmagb7xyNUCYni7YFg_8YC-6VcHX7HFkmDkxU19O6phA7tLLB0SXHSM8daHiTf1vjL5U4wi1LyOc_sP1HdKPRSYfnBXwnDH_4st1ffAKU-7-S9lizGDx2yi4sAwoczBLYIAH7AZRbV99GphEbEeQVV-o3oxQaJgJ55WWdBpOht1TK65" alt="Lagos Build"/>
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1b20]">Lagos Build Ltd.</p>
                      <p class="text-xs text-[#7a7582]">Lagos, Nigeria</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="bg-[#ece6ee] px-3 py-1 rounded-lg text-[#4f378a] text-xs font-bold border border-white/50 shadow-sm">Construction</span>
                </td>
                <td class="px-6 py-5 text-sm text-[#494551]">Oct 24, 2023</td>
                <td class="px-6 py-5 font-bold text-[#1d1b20]">$245,000</td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2 text-orange-600 bg-orange-100 px-3 py-1.5 rounded-full text-[11px] font-bold w-fit shadow-sm">
                    <span class="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                    QUOTED
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <button class="text-[#7a7582] hover:text-[#4f378a] p-2 transition-all">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>

              <!-- Row 2 -->
              <tr class="group hover:bg-gradient-to-r hover:from-[#4f378a]/5 hover:to-transparent transition-all cursor-pointer">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full border-2 border-[#e1d4fd] p-0.5 overflow-hidden shadow-sm">
                      <img class="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0epdooyg3WHm2soN7T0iZDEmV9a2T0RiCo2zI3vfth4QI_0zyo6Y2kZPsbE18_nQSFrKEbUlPjxxAVpkW91fDS510Wqww4sdUP5gl8rv65YCGdxzd6r445zxVVNG00gpIqn_AG9Kqm4YFVm43F0o5W3Ia9Qbih2kfrQ02_jUL98OARli2w6X4TB3p0eQDVv4GLKG5-8c7KLbeUp6ncXVtfX8cJ6rpJMUJRjQMRizJCs7INJGrfNRlehPOxlh9CRj37eT-CQpP-AR8" alt="Sino-Ethio"/>
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1b20]">Sino-Ethio Textiles</p>
                      <p class="text-xs text-[#7a7582]">Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="bg-[#ece6ee] px-3 py-1 rounded-lg text-[#4f378a] text-xs font-bold border border-white/50 shadow-sm">Textiles</span>
                </td>
                <td class="px-6 py-5 text-sm text-[#494551]">Oct 22, 2023</td>
                <td class="px-6 py-5 font-bold text-[#1d1b20]">$82,400</td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full text-[11px] font-bold w-fit shadow-sm">
                    <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
                    PROCESSING
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <button class="text-[#7a7582] hover:text-[#4f378a] p-2 transition-all">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>

              <!-- Row 3 -->
              <tr class="group hover:bg-gradient-to-r hover:from-[#4f378a]/5 hover:to-transparent transition-all cursor-pointer">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full border-2 border-[#cfbcff] p-0.5 overflow-hidden shadow-sm">
                      <img class="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxL7Fmtx7RCVn1eSCi_tnPAaxn1iXJU7t84VepyCcN7oKWvUWvjs3fDLYzZt-v540cDvsyZxv8l1-EuCd8NvvXiS5bDbuX2RCAHoedzkZbykI3EEUJcFlinwP7BMCKGELTotd41ssduDFdgSSvqn6Kx2_iDyutYeWfyQjX_cXSHF5xMYAkXvv8p9pvBJ7otf_r3893PnX1WMUSCpwWvd180iSGTGO8e87NM4XYR4qr6mTZMQmRuYfl4JpBKARIIqGE-QK5-SAk3P_2" alt="Nairobi Tech"/>
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1b20]">Nairobi Tech Hub</p>
                      <p class="text-xs text-[#7a7582]">Nairobi, Kenya</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="bg-[#ece6ee] px-3 py-1 rounded-lg text-[#4f378a] text-xs font-bold border border-white/50 shadow-sm">Electronics</span>
                </td>
                <td class="px-6 py-5 text-sm text-[#494551]">Oct 20, 2023</td>
                <td class="px-6 py-5 font-bold text-[#1d1b20]">$12,000</td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1.5 rounded-full text-[11px] font-bold w-fit shadow-sm">
                    <span class="w-2 h-2 bg-green-600 rounded-full"></span>
                    COMPLETED
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <button class="text-[#7a7582] hover:text-[#4f378a] p-2 transition-all">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-[#cbc4d2] flex justify-between items-center">
          <p class="text-xs text-[#494551] font-medium">Showing 1 to 10 of 1,284 entries</p>
          <div class="flex gap-2">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-[#7a7582] hover:text-[#4f378a] lift-effect disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button v-for="page in 3" :key="page" @click="changePage(page)" :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md lift-effect', currentPage === page ? 'bg-[#4f378a] text-white' : 'glass-panel text-[#1d1b20] hover:text-[#4f378a]']">
              {{ page }}
            </button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === 3" class="w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-[#7a7582] hover:text-[#4f378a] lift-effect disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- STATUS UPDATE MODAL -->
    <div :class="['fixed inset-0 z-50 flex items-center justify-center transition-all duration-300', isModalOpen ? 'visible' : 'invisible']">
      <!-- Backdrop -->
      <div 
        :class="['absolute inset-0 bg-[#322f35]/40 backdrop-blur-sm transition-opacity duration-300', isModalOpen ? 'opacity-100' : 'opacity-0']" 
        @click="closeStatusModal"
      ></div>
      
      <!-- Modal Content -->
      <div :class="['glass-panel w-[500px] rounded-3xl p-8 deep-shadow relative border-white/40 transition-all duration-300', isModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0']">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-[24px] leading-[1.3] font-bold text-[#4f378a]">Update Request Status</h3>
            <p class="text-sm text-[#494551] mt-1">Order #AF-2023-9921</p>
          </div>
          <button @click="closeStatusModal" class="text-[#7a7582] hover:text-[#4f378a] transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Status Selection -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">Update Status to:</label>
            <div class="grid grid-cols-2 gap-3">
              <button @click="selectedStatus = 'quoted'" :class="['flex items-center gap-3 p-3 rounded-2xl glass-panel inner-recess transition-all', selectedStatus === 'quoted' ? 'border-[#4f378a] bg-[#4f378a]/5 ring-2 ring-[#4f378a]' : 'hover:bg-blue-50']">
                <span class="material-symbols-outlined text-orange-600">request_quote</span>
                <span class="font-bold text-xs text-[#1d1b20]">Quoted</span>
              </button>
              <button @click="selectedStatus = 'processing'" :class="['flex items-center gap-3 p-3 rounded-2xl glass-panel inner-recess transition-all', selectedStatus === 'processing' ? 'border-[#4f378a] bg-[#4f378a]/5 ring-2 ring-[#4f378a]' : 'hover:bg-blue-50']">
                <span class="material-symbols-outlined text-blue-600">conveyor_belt</span>
                <span class="font-bold text-xs text-[#1d1b20]">Processing</span>
              </button>
              <button @click="selectedStatus = 'inspected'" :class="['flex items-center gap-3 p-3 rounded-2xl glass-panel inner-recess transition-all', selectedStatus === 'inspected' ? 'border-[#4f378a] bg-[#4f378a]/5 ring-2 ring-[#4f378a]' : 'hover:bg-green-50']">
                <span class="material-symbols-outlined text-green-600">verified</span>
                <span class="font-bold text-xs text-[#1d1b20]">Inspected</span>
              </button>
              <button @click="selectedStatus = 'shipped'" :class="['flex items-center gap-3 p-3 rounded-2xl glass-panel inner-recess transition-all', selectedStatus === 'shipped' ? 'border-[#4f378a] bg-[#4f378a]/5 ring-2 ring-[#4f378a]' : 'hover:bg-[#e6e0e9]']">
                <span class="material-symbols-outlined text-[#7a7582]">local_shipping</span>
                <span class="font-bold text-xs text-[#1d1b20]">Shipped</span>
              </button>
            </div>
          </div>

          <!-- Supplier Assignment -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">Assign Supplier (Optional):</label>
            <div class="relative">
              <select v-model="selectedSupplier" class="w-full pl-4 pr-10 py-3 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 appearance-none text-[#1d1b20] outline-none bg-transparent">
                <option>Yiwu Global Manufacturing Ltd.</option>
                <option>Shenzhen Precision Parts</option>
                <option>Guangzhou Textile Export Corp</option>
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7a7582]">expand_more</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <label class="text-[14px] leading-[1.2] tracking-[0.01em] font-semibold text-[#494551]">Internal Notes:</label>
            <textarea v-model="internalNotes" class="w-full p-4 rounded-2xl glass-panel inner-recess border-none focus:ring-4 focus:ring-[#4f378a]/20 h-24 resize-none text-[#1d1b20] outline-none bg-transparent" placeholder="Type any internal updates here..."></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button @click="closeStatusModal" class="flex-1 py-3 rounded-2xl bg-[#ece6ee] text-[#1d1b20] font-bold hover:bg-[#e6e0e9] transition-all lift-effect">
              Cancel
            </button>
            <button @click="saveChanges" class="flex-[2] px-8 py-3 rounded-2xl bg-[#4f378a] text-white font-bold shadow-lg shadow-[#4f378a]/20 border-t border-white/30 lift-effect">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive State
const searchQuery = ref('')
const currentPage = ref(1)
const isModalOpen = ref(false)
const selectedStatus = ref('quoted')
const selectedSupplier = ref('Yiwu Global Manufacturing Ltd.')
const internalNotes = ref('')

// Modal Functions
const openStatusModal = () => {
  isModalOpen.value = true
}

const closeStatusModal = () => {
  isModalOpen.value = false
}

const saveChanges = () => {
  console.log('Saving changes:', {
    status: selectedStatus.value,
    supplier: selectedSupplier.value,
    notes: internalNotes.value
  })
  closeStatusModal()
}

// Action Functions
const toggleFilters = () => console.log('Toggle filters')
const createNewRequest = () => console.log('Create new request')
const viewAll = () => console.log('View all requests')
const exportCSV = () => console.log('Export CSV')
const changePage = (page) => {
  if (page >= 1 && page <= 3) currentPage.value = page
}
const logout = () => console.log('Logout')
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

:root {
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-blur: 20px;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-top-width: 1.5px;
}

.deep-shadow {
  box-shadow: 0 20px 50px rgba(79, 70, 229, 0.15);
}

.lift-effect {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

.lift-effect:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px rgba(79, 70, 229, 0.2);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.inner-recess {
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbc4d2; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #4f378a; }
</style>