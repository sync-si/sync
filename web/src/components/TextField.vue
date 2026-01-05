<script lang="ts">
export default {
    props:{
        label: String,
        err: String, 
    },
    computed: {
        isError() {
            return !!this.err?.length
        }
    }
}


</script>

<template>
    <div :class="['text-field-base', {'text-field-error' :isError}]">
        <input type="input" :class="['input-field-base', {'input-field-error' :isError}]" name="name" id='name' required />
        <label for="name" class="text-field-label">{{label}}</label>
        <div v-if="isError" class="error-wrapper">
        <span class="error-icon">!</span>
            <div class="error-tooltip">
                {{err}}
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "../assets/theme.css";

.text-field-base {
    position: relative;
    width: 100%;
    background-color: var(--color-background-alt);
    border-bottom: 3px solid var(--color-background-alt);
    border-radius: 3px;
    display: flex;
    align-items: center;
    transition: border-color 0.2s;
    &:focus-within {
        border-color: var(--color-primary);

    }
}

.text-field-error {
    background-color: var(--color-error-light);
    border-color: var(--color-error-light);
    &:focus-within {
        border-color: var(--color-error);
    }
}

.input-field-base {
    font-family: inherit;
    width: 100%;
    border: 0;
    background: transparent;
    outline: 0;
    font-size: 1.7rem;
    color: var(--color-text);
    font-weight: 500;
    padding: 28px 0 25px 15px;
    &::placeholder {
        color: transparent;
    }

    &:focus {
        ~ .text-field-label {
            color: var(--color-primary);
        }
    }

    &:valid {
        transform: translateY(0.3em);
        ~ .text-field-label {
            transform: translateY(-1.6em);
            font-size: 1.1em;
        }
    }
}

.input-field-error {
    &:focus {
        ~ .text-field-label {
            color: var(--color-error);
        }
    }
}


.text-field-label {
    position: absolute;
    display: block;
    font-size: 1.7rem;
    font-weight: 400;
    color: var(--color-text-subtle);
    padding-left: 15px;
    margin-top: 3px;
    transform-origin: 0 0;
    transition: 0.2s;
}

.error-wrapper {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}

.error-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e53935;
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Tooltip hidden by default */
.error-tooltip {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-error);
  color: var(--color-background);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 1em;
  white-space: nowrap;

  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s;
}

/* Show on hover */
.error-wrapper:hover .error-tooltip {
  opacity: 1;
  visibility: visible;
}

</style>
