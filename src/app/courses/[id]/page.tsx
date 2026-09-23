'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
	announcements: any[]
	catalog: any[]
	logs: any[]
	members: any[]
}

type TabType = 'logs' | 'catalog' | 'incomplete' | 'progress'

export default function CourseDetailPage() {
	const params = useParams()
	const courseId = params.id as string
	const course = coursesData.courses.find(c => c.id === courseId) as Course

	const [activeTab, setActiveTab] = useState<TabType>('catalog')
	const [filterType, setFilterType] = useState<string>('全部')

	if (!course) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<p className='text-gray-500'>课程不存在</p>
					<Link href='/courses' className='mt-4 inline-block text-blue-600'>返回课程列表</Link>
				</div>
			</div>
		)
	}

	const incompleteTasks = course.catalog.filter((item: any) => !item.completed)
	const catalogTypes = ['全部', ...Array.from(new Set(course.catalog.map((i: any) => i.type)))]

	const tabs = [
		{ key: 'logs' as TabType, label: '学习日志' },
		{ key: 'catalog' as TabType, label: '学习目录' },
		{ key: 'incomplete' as TabType, label: `未完成 (${incompleteTasks.length})` },
		{ key: 'progress' as TabType, label: `进度 ${course.progress}%` }
	]

	const featureButtons = [
		{ icon: '📊', label: '成绩单' },
		{ icon: '👥', label: '成员' },
		{ icon: '✏️', label: '习题集' },
		{ icon: '💬', label: '讨论区' },
		{ icon: '👨‍👩‍👧', label: '分组' }
	]

	return (
		<div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
			<div className='sticky top-0 z-10 bg-white/80 backdrop-blur'>
				<div className='mx-auto flex max-w-4xl items-center justify-between px-4 py-4'>
					<Link href='/courses' className='flex items-center gap-2 text-gray-600 hover:text-blue-600'>
						<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
						</svg>
						返回
					</Link>
					<h1 className='text-lg font-semibold text-gray-800'>{course.name}</h1>
					<div className='w-10' />
				</div>
			</div>

			<div className='mx-auto max-w-4xl px-4 py-6'>
				<div className='mb-6 rounded-2xl bg-white p-6 shadow-sm'>
					<h2 className='text-2xl font-bold text-gray-800'>{course.class}</h2>
					<p className='mt-2 text-sm text-gray-500'>开课时间：{course.startDate} 至 {course.endDate}</p>

					<div className='mt-6 grid grid-cols-5 gap-4'>
						{featureButtons.map((btn, idx) => (
							<div key={idx} className='flex flex-col items-center gap-2'>
								<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl'>{btn.icon}</div>
								<span className='text-xs text-gray-600'>{btn.label}</span>
							</div>
						))}
					</div>
				</div>

				<div className='mb-4 flex gap-6 overflow-x-auto border-b bg-white px-4 pt-4'>
					{tabs.map(tab => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
								activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className='mt-4'>
					{activeTab === 'catalog' && (
						<div>
							<div className='mb-4 flex gap-2 overflow-x-auto'>
								{catalogTypes.map((type: string) => (
									<button
										key={type}
										onClick={() => setFilterType(type)}
										className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
											filterType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
										}`}
									>
										{type}
									</button>
								))}
							</div>

							<div className='space-y-3'>
								{course.catalog
									.filter((item: any) => filterType === '全部' || item.type === filterType)
									.map((item: any) => (
										<div key={item.id} className='flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm'>
											<span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
												item.type === '考试' ? 'bg-red-50 text-red-600'
												: item.type === '作业' ? 'bg-orange-50 text-orange-600'
												: 'bg-green-50 text-green-600'
											}`}>
												{item.type}
											</span>
											<div className='flex-1'>
												<p className='text-sm font-medium text-gray-800'>{item.title}</p>
												{item.dueDate && <p className='mt-1 text-xs text-gray-400'>截止于 {item.dueDate}</p>}
											</div>
											{item.completed && (
												<svg className='h-5 w-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
													<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
												</svg>
											)}
										</div>
									))}
							</div>
						</div>
					)}

					{activeTab === 'logs' && (
						<div className='space-y-6'>
							{course.logs.map((log: any, idx: number) => (
								<div key={log.id} className='relative pl-6'>
									{idx < course.logs.length - 1 && (
										<div className='absolute left-2 top-8 h-full w-0.5 bg-blue-100' />
									)}
									<div className='absolute left-0 top-2 h-4 w-4 rounded-full border-4 border-blue-500 bg-white' />
									<div className='mb-2'>
										<span className='text-lg font-bold text-gray-800'>{log.date}</span>
										<span className='ml-2 text-sm text-gray-500'>{log.weekday}</span>
									</div>
									<div className='rounded-xl bg-white p-4 shadow-sm'>
										<div className='mb-2 flex items-center gap-2'>
											<span className='text-sm text-gray-400'>{log.time}</span>
											<span className='rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600'>{log.type}</span>
										</div>
										<p className='text-sm font-medium text-gray-800'>{log.title}</p>
									</div>
								</div>
							))}
						</div>
					)}

					{activeTab === 'incomplete' && (
						<div className='space-y-3'>
							{incompleteTasks.length === 0 ? (
								<p className='py-8 text-center text-gray-500'>太棒了，全部完成！</p>
							) : (
								incompleteTasks.map((item: any) => (
									<div key={item.id} className='flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm'>
										<span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
											item.type === '考试' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
										}`}>
											{item.type}
										</span>
										<div className='flex-1'>
											<p className='text-sm font-medium text-gray-800'>{item.title}</p>
											{item.dueDate && <p className='mt-1 text-xs text-red-500'>截止于 {item.dueDate}</p>}
										</div>
									</div>
								))
							)}
						</div>
					)}

					{activeTab === 'progress' && (
						<div className='rounded-xl bg-white p-6 shadow-sm'>
							<div className='mb-4 text-center'>
								<span className='text-4xl font-bold' style={{ color: course.color }}>{course.progress}%</span>
							</div>
							<div className='h-3 overflow-hidden rounded-full bg-gray-100'>
								<div className='h-full rounded-full' style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
							</div>
							<p className='mt-4 text-center text-sm text-gray-500'>已完成 {course.completedTasks} / {course.totalTasks} 项任务</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
