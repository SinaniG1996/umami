import React, { useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import DateFilter from 'components/common/DateFilter';
import TableNew from 'components/common/TableNew';
import Pagination from 'components/common/Pagination';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import useShareToken from 'hooks/useShareToken';
import Arrow from 'assets/arrow-right.svg';
import { get } from 'lib/web';
import { TOKEN_HEADER } from 'lib/constants';
import { useRouter } from 'next/router';
import { useTable, usePagination, useSortBy } from 'react-table';
import { setWebsitesData } from 'redux/actions/websites';
import find from 'lodash.find';
import Loader from 'react-loader-spinner';
import styles from './WebsiteList.module.css';

export default function WebsiteList({ userId }) {
  const [stats, setStats] = useState([]);
  const dispatch = useDispatch();
  const fetchedData = useFetch('/api/websites', { params: { user_id: userId } });
  const { basePath } = useRouter();
  const shareToken = useShareToken();
  const websites = useSelector(state => state.websites);
  const [dateRange, setDateRange] = useDateRange();
  const { startDate, endDate, value } = dateRange;

  const websiteIds = useMemo(() => {
    if (!fetchedData.data) return [1];
    return fetchedData.data.map(site => site.website_id);
  }, [fetchedData.data]);

  const getStats = async () => {
    const url = '/api/website/stats';
    get(
      `${basePath}${url}`,
      {
        ids: websiteIds,
        start_at: +startDate,
        end_at: +endDate,
      },
      {
        [TOKEN_HEADER]: shareToken?.token,
      },
    ).then(res => {
      if (res.ok) setStats(res.data);
    });
  };

  useLayoutEffect(() => {
    getStats();
  }, [fetchedData.data, stats.length, value]);

  useEffect(() => {
    if (!fetchedData.data || !stats.length) return [];

    const _data = [];
    fetchedData.data.forEach(i => {
      const stat = find(stats, { id: i.website_id }) || {};
      _data.push({ ...i, ...stat.data });
    });

    dispatch(setWebsitesData(_data));
  }, [fetchedData.data, stats.length, value]);

  const tableColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Domain',
        accessor: 'domain',
      },
      {
        Header: 'Views',
        accessor: 'pageviews',
      },
      {
        Header: 'Visitors',
        accessor: 'uniques',
      },
      {
        Header: 'Bounce rate',
        accessor: 'bounces',
      },
      {
        Header: 'Details',
        accessor: 'details',
        Cell: ({ website_id }) => (
          <Link
            href="/website/[...id]"
            as={`/website/${website_id}/${name}`}
            icon={<Arrow />}
            size="small"
            iconRight
          >
            Details
          </Link>
        ),
      },
    ],
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: tableColumns,
      data: websites,
      initialState: {
        pageIndex: 0,
        pageSize: 50,
        sortBy: [
          {
            id: 'pageviews',
            desc: true,
          },
        ],
      },
    },
    useSortBy,
    usePagination,
  );

  return (
    <Page className={styles.root}>
      <div className={styles.range}>
        <b className={styles.rangeText}>Range:</b>
        <DateFilter value={value} startDate={startDate} endDate={endDate} onChange={setDateRange} />
      </div>
      <TableNew
        getTableProps={getTableProps}
        getTableBodyProps={getTableBodyProps}
        headerGroups={headerGroups}
        prepareRow={prepareRow}
        page={page}
      />
      {stats.length === 0 && (
        <div className={styles.loader}>
          <Loader type="ThreeDots" color="#ccc" height={80} width={80} />
        </div>
      )}
      <Pagination
        gotoPage={gotoPage}
        canPreviousPage={canPreviousPage}
        previousPage={previousPage}
        canNextPage={canNextPage}
        nextPage={nextPage}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
      {fetchedData.status === 200 && fetchedData.data.length === 0 && stats.length === 0 && (
        <EmptyPlaceholder
          msg={
            <FormattedMessage
              id="message.no-websites-configured"
              defaultMessage="You don't have any websites configured."
            />
          }
        >
          <Link href="/settings" icon={<Arrow />} iconRight>
            <FormattedMessage id="message.go-to-settings" defaultMessage="Go to settings" />
          </Link>
        </EmptyPlaceholder>
      )}
    </Page>
  );
}
