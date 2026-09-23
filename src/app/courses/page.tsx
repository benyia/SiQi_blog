'use client'

import { useState } from 'react'
import Link from 'next/link'
import coursesData from '@/config/courses.json'

interface Course {
	id: string
	name: string
	class: string
	startDate: string
	endDate: string
	progress: number
	totalTasks: number
	completedTasks: number
	color: string
}

export default function CoursesPage() {
	const [courses] = useState<Course[]>(coursesData.courses)

	return (
		<div className='min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8'>
			<div className='mx-auto max-w-4xl'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-800'>我的课程</h1>
					<p className='mt-2 text-gray-500'>共 {courses.length} 门课程</p>
				</div>

				<div className='grid gap-4 md:grid-cols-2'>
					{courses.map(course => (
						<Link
							key={course.id}
							href={`/courses/${course.id}`}
							className='group block rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md'
						>
							<div className='mb-4 flex items-start gap-4'>
								<div
									className='flex h-12 w-12 items-center justify-center rounded-xl text-white'
									style={{ backgroundColor: course.color }}
								>
									<svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13.493C12 20.51 10.043 22 7.5 22S3 20.51 3 19.746V6.254C3 6.99 4.043 7.5 5.5 7.5c1.457 0 2.5-.51 2.5-1.247zM12 6.253v13.493C12 20.51 13.957 22 16.5 22s4.5-1.49 4.5-2.254V6.254c0 .736-1.043 1.246-2.5 1.246-1.457 0-2.5-.51-2.5-1.247z' />
									</svg>
								</div>
								<div className='flex-1'>
									<h3 className='text-lg font-semibold text-gray-800 group-hover:text-blue-600'>{course.name}</h3>
									<p className='mt-1 text-sm text-gray-500'>{course.class}</p>
								</div>
							</div>

							<div className='mb-2'>
								<div className='mb-1 flex justify-between text-sm'>
									<span className='text-gray-500'>学习进度</span>
									<span className='font-medium' style={{ color: course.color }}>{course.progress}%</span>
								</div>
								<div className='h-2 overflow-hidden rounded-full bg-gray-100'>
									<div className='h-full rounded-full transition-all' style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
								</div>
							</div>

							<div className='flex items-center justify-between text-sm text-gray-500'>
								<span>已完成 {course.completedTasks} / {course.totalTasks} 项任务</span>
								<svg className='h-4 w-4 transition-transform group-hover:translate-x-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</div>
						</Link>
					))}
				</div>

				<div className='mt-8 text-center'>
					<Link href='/' className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600'>
						<svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
						</svg>
						返回首页
					</Link>
				</div>
			</div>
		</div>
	)
}
