import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionPage,
  onClick 
}) {
  return (
    <div className="glass rounded-xl p-12 text-center border border-slate-200">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
      {(actionPage || onClick) && (
        <>
          {actionPage ? (
            <Link to={createPageUrl(actionPage)}>
              <Button className="bg-slate-900 hover:bg-slate-800">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={onClick} className="bg-slate-900 hover:bg-slate-800">
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}