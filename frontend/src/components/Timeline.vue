<template>
  <div class="flow-root">
    <ul role="list" class="-mb-8">
      <li v-for="(step, stepIdx) in steps" :key="step.name">
        <div class="relative pb-8">
          <span v-if="stepIdx !== steps.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
          <div class="relative flex space-x-3">
            <div>
              <span :class="[step.completed ? 'bg-emerald-500' : (step.current ? 'bg-primary' : 'bg-gray-300'), 'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white']">
                <!-- Simple dot or check -->
                <svg v-if="step.completed" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                </svg>
                <div v-else-if="step.current" class="h-2.5 w-2.5 bg-white rounded-full"></div>
              </span>
            </div>
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm text-gray-500">{{ step.name }}</p>
              </div>
              <div class="text-right text-sm whitespace-nowrap text-gray-500">
                <time v-if="step.date" :datetime="step.date">{{ new Date(step.date).toLocaleDateString() }}</time>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentStatus: {
    type: String,
    required: true
  },
  logs: {
    type: Array,
    default: () => []
  }
});

const statusOrder = ['pending', 'quoted', 'approved', 'production', 'shipped', 'arrived', 'completed'];

const steps = computed(() => {
  const currentIndex = statusOrder.indexOf(props.currentStatus);
  
  return [
    { name: 'Request Received', status: 'pending' },
    { name: 'Quote Provided', status: 'quoted' },
    { name: 'Quote Approved', status: 'approved' },
    { name: 'Production & QC', status: 'production' },
    { name: 'Shipped', status: 'shipped' },
    { name: 'Arrived', status: 'arrived' },
    { name: 'Completed', status: 'completed' }
  ].map(s => {
    const sIndex = statusOrder.indexOf(s.status);
    const log = props.logs.find(l => l.status === s.status);
    return {
      ...s,
      completed: sIndex < currentIndex || (sIndex === currentIndex && s.status === 'completed'),
      current: sIndex === currentIndex && s.status !== 'completed',
      date: log ? log.created_at : null
    };
  });
});
</script>
