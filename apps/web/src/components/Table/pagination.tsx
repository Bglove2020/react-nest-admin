import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@ruoyi/ui"
import type { Table } from "@tanstack/react-table"

export function DataTablePagination({ table }: { table: Table<any> }) {

  const pageCount = table.getPageCount()
  let pageNumbers = []
  if(pageCount <= 6) {
    pageNumbers = [...Array(pageCount).keys()].map(index => index + 1)
  }
  else{
    const nowPage = table.getState().pagination.pageIndex + 1
    if(nowPage <= 3) {
      pageNumbers = [1,2,3,4,-1,pageCount]
    }
    else if(nowPage >= pageCount - 2) {
      pageNumbers = [1,-1,pageCount-3,pageCount-2,pageCount-1,pageCount]
    }
    else{
      pageNumbers = [1,-1,nowPage-1,nowPage,nowPage+1,-1,pageCount]
    }  
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            className="border border-input aria-disabled:opacity-50 aria-disabled:cursor-not-allowed" 
            aria-disabled={!table.getCanPreviousPage()}
            tabIndex={table.getCanPreviousPage() ? 0 : -1}
            onClick={(e) => {
                e.preventDefault();
                if(!table.getCanPreviousPage()) return
                table.previousPage()
              }
            }
            />
        </PaginationItem>
        {
          pageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              {
                pageNumber === -1 ? 
                  <PaginationEllipsis /> 
                  : (
                      <PaginationLink 
                        href="#" 
                        isActive={pageNumber === table.getState().pagination.pageIndex + 1}
                        onClick={(e) => {
                            e.preventDefault();
                            console.log(pageNumber)
                            table.setPageIndex(pageNumber - 1)
                          }
                        }
                        >
                        {pageNumber}
                      </PaginationLink>
                  )
              }
              
            </PaginationItem>
          ))
        }

        <PaginationItem>
          <PaginationNext 
            href="#" 
            className="border border-input aria-disabled:opacity-50 aria-disabled:cursor-not-allowed" 
            aria-disabled={!table.getCanNextPage()}
            tabIndex={table.getCanNextPage() ? 0 : -1}
            onClick={(e) => {
                e.preventDefault();
                if(!table.getCanNextPage()) return
                table.nextPage()
              }
            }
            />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
