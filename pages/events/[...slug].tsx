import styles from '../../styles/Shared.module.css'
import { getAllEventsFromServer, getFilteredEvents } from './../../dummy-data';
import EventList from '../../components/events/event-list';
import EventsSearch from './../../components/events/event-search';
import { IEvent, getArrayFromObjectDataEvents } from '../../dummy-data';
import { GetServerSideProps, } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Head from 'next/head';



interface IServerProps {
    month: number,
    year: number,
    dataEvents?: IEvent[],
    errorServer?: string,
}
interface IServerParams extends ParsedUrlQuery {
    slug: Array<string>
}

const URL_EVENTS = 'https://nextclients-default-rtdb.europe-west1.firebasedatabase.app/events.json'

export const messageComponent = (value: string): JSX.Element => (
    <>
        <EventsSearch />
        <div className={styles.container}>
            <h1>{`${value}`}</h1>
        </div>
    </>
)

function FilterEventPages({ dataEvents, errorServer, month, year }: IServerProps) {
    const router = useRouter()

    // const paramSlug = router.query.slug

    const [dataEvent, setDataEvent] = useState(dataEvents!)

    const { data, error } = useSWR(URL_EVENTS)

    const pageHeaderDetail = (
        <Head>
            <title>Filter events for {`${month}/${year} `}</title>
            <meta
                name="description"
                content={`All events for ${month}/${year} `}
            />
        </Head>
    )

    useEffect(() => {
        if (data && !data.error && router.query.slug?.length == 2) {
            // const year: number = + router.query.slug[0]
            // const month: number = + router.query.slug[1]
            const dataEventsClientSide = getArrayFromObjectDataEvents(data);
            const dataFilter = getFilteredEvents({ year, month }, dataEventsClientSide)
            setDataEvent(dataFilter)

        }
        return () => {

        }
    }, [data])

    if (error) {
        return messageComponent('Error: searching data')
    }
    if (dataEvents && dataEvents.length == 0) {
        return (
            <>
                {pageHeaderDetail}
                {messageComponent('no Events fount')}
            </>
        )
    }
    if (dataEvent) {
        return (
            <>
                {pageHeaderDetail}
                <EventsSearch />
                <EventList items={dataEvent} key={'1111'} />
            </>
        );
    }
}

export default FilterEventPages;

export const getServerSideProps: GetServerSideProps<IServerProps, IServerParams> = async ({ params }) => {

    const dataEvents: IEvent[] = []

    const month: number = +params!.slug[1]
    const year: number = +params!.slug[0]

    if (!params?.slug[0] || !params?.slug[1] || params?.slug.length !== 2) {
        return {
            props: { errorServer: "no data", month, year }
        }

    }
    const dataAllEvents = await getAllEventsFromServer()
    const dataHelper = getFilteredEvents({ year, month }, dataAllEvents)
    dataHelper.map(el => {
        dataEvents.push(el)
    })

    return {
        props: { dataEvents, month, year }
    }
}