'use client'

import { useRouter } from 'next/navigation'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { useLayoutEditStore } from '@/app/(home)/stores/layout-edit-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'
import coursesData from '@/config/courses.json'

export default function CoursesCard() {
	const router = useRouter()
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)

	const styles = cardStyles.coursesCard || {
		width: 200,
		height: 80,
		offsetX: null,
		offsetY: null,
		order: 5
	}

	const courses = coursesData.courses
	const avgProgress = Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING * 4
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + CARD_SPACING

	return (
		<HomeDraggableLayer cardKey='coursesCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='p-3'>
				<div
					onClick={() => { if (!editing) router.push('/courses') }}
					className='bg-secondary/20 card-rounded flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-2 transition-all hover:bg-secondary/30'
				>
					<div className='flex items-center gap-2'>
						<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13.493C12 20.51 10.043 22 7.5 22S3 20.51 3 19.746V6.254C3 6.99 4.043 7.5 5.5 7.5c1.457 0 2.5-.51 2.5-1.247zM12 6.253v13.493C12 20.51 13.957 22 16.5 22s4.5-1.49 4.5-2.254V6.254c0 .736-1.043 1.246-2.5 1.246-1.457 0-2.5-.51-2.5-1.247z' />
						</svg>
						<span className='text-sm font-medium'>我的课程</span>
					</div>
					<p className='text-xs opacity-70'>{courses.length} 门课 · 平均 {avgProgress}%</p>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
