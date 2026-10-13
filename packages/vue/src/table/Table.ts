import { TABLE_DENSITIES, resolveTableOptions } from '@morfira-dev/core/table';
import type { TableDensity, TableOptions } from '@morfira-dev/core/table';
import { defineComponent, h, mergeProps } from 'vue';
import type { DefineComponent, PropType, TableHTMLAttributes, VNode } from 'vue';

type NativeTableProps = Omit<TableHTMLAttributes, keyof TableOptions>;
export interface TableProps extends NativeTableProps, TableOptions {}

export const Table = defineComponent({
  name: 'MorfiraTable',
  inheritAttrs: false,
  props: {
    density: {
      type: String as PropType<TableDensity>,
      default: 'comfortable',
      validator: (value: unknown) => TABLE_DENSITIES.includes(value as TableDensity),
    },
    striped: { type: Boolean, default: false },
    hoverable: { type: Boolean, default: false },
    stickyHeader: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }): () => VNode {
    return () => {
      const options = resolveTableOptions({
        density: props.density ?? 'comfortable',
        striped: props.striped ?? false,
        hoverable: props.hoverable ?? false,
        stickyHeader: props.stickyHeader ?? false,
      });
      return h(
        'table',
        mergeProps(attrs, {
          'data-morfira-table': '',
          'data-density': options.density,
          'data-striped': options.striped ? '' : undefined,
          'data-hoverable': options.hoverable ? '' : undefined,
          'data-sticky-header': options.stickyHeader ? '' : undefined,
        }),
        slots.default?.(),
      );
    };
  },
}) as DefineComponent<TableProps>;
